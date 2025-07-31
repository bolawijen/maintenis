import { FileSink } from "bun";


const LOG_FILE_PATH = `${import.meta.dir}/runtime/logs/app.log`;


let logWriter: FileSink;

const activeEventStreamControllers = new Set<ReadableStreamDefaultController>();

export async function initializeLogWriter() {
  try {
    let existingContent = "";
    try {
      existingContent = await Bun.file(LOG_FILE_PATH).text();
    } catch (readError: any) {
      if (readError.code !== 'ENOENT') { // Ignore ENOENT, file will be created
        console.error("Error reading existing log file content:", readError);
        process.exit(1);
      }
    }

    logWriter = Bun.file(LOG_FILE_PATH).writer(); // This will create/truncate the file
    if (existingContent) {
      logWriter.write(existingContent); // Write back existing content
    }
  } catch (error: any) {
    console.error("Error initializing log writer:", error);
    process.exit(1);
  }
}

initializeLogWriter(); // Call the initialization function

type LogEntry = {
  context: object;
  level: 'error' | 'info' | 'debug' | 'warning';
  line: string;
  message: string;
  time: number;
};

const logRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[([a-z]+)\]\[[a-z]+\] (.*)$/;

function parseSingleLogEntry(logLine: string): LogEntry | null {
  const match = logLine.match(logRegex);
  if (match) {
    const timestampStr = match[1];
    const level = match[2] as LogEntry['level'];
    const message = match[3];

    const date = new Date(timestampStr.replace(' ', 'T'));
    const time = date.getTime();

    return {
      context: {},
      level: level,
      line: "", // No file/line info in current log format
      message: message,
      time: time,
    };
  }
  return null;
}

async function parseLogFile(logFilePath: string): Promise<LogEntry[]> {
  try {
    const logContent = await Bun.file(logFilePath).text();
    const lines = logContent.split("\n");
    const logEntries: LogEntry[] = [];

    for (const line of lines) {
      const entry = parseSingleLogEntry(line);
      if (entry) {
        logEntries.push(entry);
      }
    }

    return logEntries.sort((a, b) => b.time - a.time);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    console.error("Error parsing log file:", error);
    throw error; // Re-throw other errors
  }
}

const defaultHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const createResponse = (status: number = 200, body: any = null, headers: HeadersInit = {}) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...defaultHeaders, ...headers },
  });
};

export const routes = {
  "/debug/api/logs": {
    OPTIONS: createResponse(204),
    async GET() {
      try {
        const logs = await parseLogFile(LOG_FILE_PATH);
        return createResponse(200, logs);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          return createResponse(200, []);
        }
        console.error("Error reading log file:", error);
        return createResponse(500, { error: "Could not read log file" });
      }
    },
  },
  "/debug/api/": {
    OPTIONS: createResponse(204),
    async GET() {
      try {
        const logEntries = await parseLogFile(LOG_FILE_PATH);
        const debugEntry = {
          id: "bun-logs-debug-entry", // A generic ID for the collection of logs
          collectors: ["Log"], // Indicate that this entry contains log data
          summary: {
            Log: logEntries, // All parsed log entries go here
          },
        };
        return createResponse(200, { data: [debugEntry] }); // Return as an array of DebugEntry
      } catch (error) {
        console.error("Error reading log file for debug API:", error);
        return createResponse(500, { error: "Could not read log file for debug API" });
      }
    },
  },
  "/debug/api/object/:debugEntryId/:objectId": {
    OPTIONS: createResponse(204),
    async GET(request: Request) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/');
      const debugEntryId = parts[4];
      const objectId = parts[5];
      return createResponse(200, { class: "MockObject", value: { id: objectId, data: "Some mock object data for " + debugEntryId } });
    },
  },
  "/debug/api/view/:id": {
    OPTIONS: createResponse(204),
    async GET(request: Request) {
      const url = new URL(request.url);
      const id = url.pathname.split('/')[4];
      const collector = url.searchParams.get('collector');

      if (id === "bun-logs-debug-entry" && collector === "Log") {
        try {
          const logEntries = await parseLogFile(LOG_FILE_PATH);
          return createResponse(200, { data: logEntries });
        } catch (error) {
          console.error("Error reading log file for /debug/api/view/log:", error);
          return createResponse(500, { error: "Could not read log file for log collector" });
        }
      }

      return createResponse(200, { data: { id: id, collector: collector, details: "Mock details for " + collector } });
    },
  },
  "/debug/api/event-stream": {
    OPTIONS: createResponse(204),
    async GET() {
      const encoder = new TextEncoder();

      const sendHeartbeat = (controller) => {
        setTimeout(() => {
          if (activeEventStreamControllers.has(controller)) { // Only send if controller is still active
            try {
              
              controller.enqueue(encoder.encode(`:keep-alive\n\n`)); // SSE comment line for heartbeat
            } catch (err) {
              console.error("Error sending heartbeat:", err);
            }
            sendHeartbeat(controller)
          }
        }, (globalThis.serverIdleTimeout - 3) * 1000);
      }

      const readable = new ReadableStream({
        start(controller) {
          activeEventStreamControllers.add(controller);
          
          const encoder = new TextEncoder();
          const initialMessage = `event: connected\ndata:\n\n`;
          controller.enqueue(encoder.encode(initialMessage));
          sendHeartbeat(controller)
        },
        cancel(controller) {
          activeEventStreamControllers.delete(controller);
          
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          ...defaultHeaders,
        },
      });
    },
  },
  "/debug/api/log": {
    OPTIONS: createResponse(204),
    async POST(request: Request) {
      try {
        const logMessage = await request.text();
        const formattedLog = `${logMessage}\n`;
        if (logWriter) {
          logWriter.write(formattedLog);
          const parsedLogEntry = parseSingleLogEntry(logMessage);
          if (parsedLogEntry) {
            const encoder = new TextEncoder();
            const message = `event: log-updated\ndata: ${JSON.stringify(parsedLogEntry)}\n\n`;
            for (const controller of activeEventStreamControllers) {
              try {
                controller.enqueue(encoder.encode(message));
              } catch (err) {
                console.error("Error enqueuing message to SSE controller:", err);
                // Remove the problematic controller if it's consistently failing
                activeEventStreamControllers.delete(controller);
              }
            }
          } else {
            console.warn("Could not parse incoming log message for SSE:", logMessage);
          }
        } else {
          console.error("Log writer not initialized.");
          return createResponse(500, { error: "Log writer not initialized" });
        }
        return createResponse(200, { status: "success" });
      } catch (error) {
        console.error("Error writing log:", error);
        return createResponse(500, { error: "Could not write log" });
      }
    },
  },
};