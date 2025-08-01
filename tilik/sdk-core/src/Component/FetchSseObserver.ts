import untry from '../Helper/untry';

async function* createLineReader(reader: ReadableStreamDefaultReader<Uint8Array>) {
    let buffer;
    let position = 0; // current read position
    let fieldLength = -1; // length of the `field` portion of the line
    let discardTrailingNewline = false;
    let result;
    while (!(result = await reader.read()).done) {
        const arr = result.value;
        if (buffer === undefined) {
            buffer = arr;
            position = 0;
            fieldLength = -1;
        }
        else {
            // we're still parsing the old line. Append the new bytes into buffer:
            const res: Uint8Array = new Uint8Array(buffer.length + arr.length);
            res.set(buffer);
            res.set(arr, buffer.length);
            buffer = res;
        }
        const bufLength = buffer.length;
        let lineStart = 0; // index where the current line starts
        while (position < bufLength) {
            if (discardTrailingNewline) {
                if (buffer[position] === 10 /* ControlChars.NewLine */) {
                    lineStart = ++position; // skip to next char
                }
                discardTrailingNewline = false;
            }
            // start looking forward till the end of line:
            let lineEnd = -1; // index of the \r or \n char
            for (; position < bufLength && lineEnd === -1; ++position) {
                switch (buffer[position]) {
                    case 58 /* ControlChars.Colon */:
                        if (fieldLength === -1) {
                            // first colon in line
                            fieldLength = position - lineStart;
                        }
                        break;
                    // @ts-ignore:7029 \r case below should fallthrough to \n:
                    case 13 /* ControlChars.CarriageReturn */:
                        discardTrailingNewline = true;
                    case 10 /* ControlChars.NewLine */:
                        lineEnd = position;
                        break;
                }
            }
            if (lineEnd === -1) {
                // We reached the end of the buffer but the line hasn't ended.
                // Wait for the next arr and then continue parsing:
                break;
            }
            // we've reached the line end, send it out:
            const line = buffer.subarray(lineStart, lineEnd);
            yield { line, fieldLength };
            lineStart = position; // we're now on the next line
            fieldLength = -1;
        }
        if (lineStart === bufLength) {
            buffer = undefined; // we've finished reading it;
        }
        else if (lineStart !== 0) {
            // Create a new view into buffer beginning at lineStart so we don't
            // need to copy over the previous lines when we get the new arr:
            buffer = buffer.subarray(lineStart);
            position -= lineStart;
        }
    }
    // get anything that is still in the buffer
    if (buffer !== undefined) {
        const line = buffer;
        yield { line, fieldLength };
    }
}

function isEventSourceMessagePartEmpty(value: EventMessagePart): value is { type: "empty" } {
    return value.type === "empty";
}
function isEventSourceMessagePartData(value: EventMessagePart): value is { type: "data"; value: string } {
    return value.type === "data";
}
function isEventSourceMessagePartEvent(value: EventMessagePart): value is { type: "event"; value: string } {
    return value.type === "event";
}
function isEventSourceMessagePartId(value: EventMessagePart): value is { type: "id"; value: string } {
    return value.type === "id";
}
function isEventSourceMessagePartRetry(value: EventMessagePart): value is { type: "retry"; value: number } {
    return value.type === "retry";
}

type EventMessagePart =
    | { type: "empty" }
    | { type: "data"; value: string }
    | { type: "event"; value: string }
    | { type: "id"; value: string }
    | { type: "retry"; value: number };

interface EventMessage {
    data: string;
    event: string;
    id: string;
    retry: number | undefined;
}

async function* readEventMessagePart(
    reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<EventMessagePart, void, unknown> {
    const decoder = new TextDecoder();
    for await (const { line, fieldLength } of createLineReader(reader)) {
        if (line.length === 0) {
            // empty line denotes end of message. Trigger the callback and start a new message:
            yield { type: "empty" };
        } else if (fieldLength > 0) {
            // exclude comments and lines with no values
            // line is of format "<field>:<value>" or "<field>: <value>"
            // https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation
            const field = decoder.decode(line.subarray(0, fieldLength));
            const valueOffset = fieldLength + (line[fieldLength + 1] === 32 /* ControlChars.Space */ ? 2 : 1);
            const value = decoder.decode(line.subarray(valueOffset));
            switch (field) {
                case "data":
                    yield { type: "data", value };
                    break;
                case "event":
                    yield { type: "event", value };
                    break;
                case "id":
                    yield { type: "id", value };
                    break;
                case "retry":
                    const retry = parseInt(value, 10);
                    if (!isNaN(retry)) {
                        // per spec, ignore non-integers
                        yield { type: "retry", value: retry };
                    }
                    break;
            }
        }
    }
}

async function* createEventMessageReader(
    reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<EventMessage, void, unknown> {
    let message: EventMessage = {
        data: "",
        event: "",
        id: "",
        retry: undefined,
    };
    for await (const part of readEventMessagePart(reader)) {
        if (isEventSourceMessagePartEmpty(part)) {
            yield message;
            message = {
                data: "",
                event: "",
                id: "",
                retry: undefined,
            };
        } else if (isEventSourceMessagePartData(part)) {
            message.data = message.data ? message.data + "\n" + part.value : part.value;
        } else if (isEventSourceMessagePartEvent(part)) {
            message.event = part.value;
        }
        else if (isEventSourceMessagePartId(part)) {
            message.id = part.value;
        }
        else if (isEventSourceMessagePartRetry(part)) {
            message.retry = part.value;
        }
    }

    if (message.data) {
        yield message;
    }
}

interface Connection {
    controller: AbortController | null;
    readyState: number;
    fetch: Promise<Response>;
}

const connections = new Map<string, Connection>();

export class FetchSseObserver {
    public url: string;
    public readonly client = fetch;
    private listeners: Map<string, Set<((event: MessageEvent) => void)>> = new Map();
    private globalListeners: Set<((event: MessageEvent) => void)> = new Set();
    private retryTimeout: ReturnType<typeof setTimeout> | undefined;
    private closeTimeoutId: ReturnType<typeof setTimeout> | undefined; // New property
    private connection: Connection | undefined;

    constructor(url: string) {
        this.url = url;
    }

    subscribe(eventType: string, subscriber: (event: MessageEvent) => void) {
        if (eventType === 'message') {
            this.globalListeners.add(subscriber);
        } else {
            if (!this.listeners.has(eventType)) {
                this.listeners.set(eventType, new Set());
            }
            this.listeners.get(eventType)?.add(subscriber);
        }

        if (!this.connection || this.connection.readyState === EventSource.CLOSED) {
            this.connect();
        }
    }

    unsubscribe(eventType: string, subscriber: (event: MessageEvent) => void) {
        if (eventType === 'message') {
            this.globalListeners.delete(subscriber);
        }
        else {
            this.listeners.get(eventType)?.delete(subscriber);
            if (this.listeners.get(eventType)?.size === 0) {
                this.listeners.delete(eventType);
            }
        }
        // If no more global listeners and no more specific listeners, close the event source
        if (this.globalListeners.size === 0 && this.listeners.size === 0) {
            this.close();
        }
    }

    close() {
        // Clear any pending retry or close timeouts
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = undefined;
        }
        if (this.closeTimeoutId) {
            clearTimeout(this.closeTimeoutId);
            this.closeTimeoutId = undefined;
        }

        if (this.connection?.controller) {
            if (this.connection.readyState === EventSource.CONNECTING) {
                // Schedule abort if still connecting
                this.closeTimeoutId = setTimeout(() => {
                    if (this.connection?.controller && this.connection.readyState === EventSource.CONNECTING) {
                        this.connection.controller.abort();
                        this.connection.controller = null;
                        this.connection.readyState = EventSource.CLOSED; // Set to CLOSED after abort
                    }
                    this.closeTimeoutId = undefined; // Clear timeout ID after execution
                }, 2000); // 2 seconds delay
            } else {
                // Abort immediately if not connecting (already open or closed)
                this.connection.controller.abort();
                this.connection.controller = null;
                this.connection.readyState = EventSource.CLOSED; // Set to CLOSED immediately
            }
        } else {
            // If no controller, just ensure state is closed if connection exists
            if (this.connection) {
                this.connection.readyState = EventSource.CLOSED;
            }
        }

        // Clear all listeners and remove from global connections map
        this.listeners.clear();
        this.globalListeners.clear();
        connections.delete(this.url);
    }

    private async connect() {
        if (this.connection && this.connection.readyState !== EventSource.CLOSED) {
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        this.connection = {
            controller,
            readyState: EventSource.CONNECTING, // Initial state
            fetch: fetch(this.url, { signal }),
        };

        connections.set(this.url, this.connection);

        const [response, fetchError] = await untry<Response, Error>(this.connection.fetch);

        if (fetchError) {
            if (fetchError.name !== 'AbortError') {
                this.retryConnection();
            }
            return;
        }

        if (!response || !response.ok || !response.body) {
            this.retryConnection();
            return;
        }

        this.connection.readyState = EventSource.OPEN;

        const [reader, readerError] = untry(response.body!.getReader.bind(response.body!));

        if (readerError) {
            console.error(
                '[FetchSseObserver] CRITICAL LOGIC ERROR: Attempted to read a locked stream. Connection will be terminated without retry.',
                readerError,
            );
            this.connection.readyState = EventSource.CLOSED;
            return;
        }
        if (!reader) {
            this.connection.readyState = EventSource.CLOSED;
            return;
        }

        const [_, streamError] = await untry(async () => {
            for await (const message of createEventMessageReader(reader as ReadableStreamDefaultReader<Uint8Array>)) {
                if (this.connection?.readyState === EventSource.CLOSED) break;

                if (message.retry !== undefined) {
                    // Handle retry logic if needed
                }
                
                this.handle(message);
            }
        });

        if (streamError) {
            // console.error('[FetchSseObserver] Error reading stream. Connection terminated.', streamError);
        }

        if (this.connection && this.connection.readyState !== EventSource.CLOSED) {
            this.connection.readyState = EventSource.CLOSED;
        }
    }

    private retryConnection(retryDelay = 3000) {
        if (this.connection && this.connection.readyState !== EventSource.CLOSED) {
            this.retryTimeout = setTimeout(() => this.connect(), retryDelay);
        }
    }

    private handle(message: EventMessage) {
        const event = new MessageEvent(message.event || 'message', {
            data: message.data,
            lastEventId: message.id,
        });

        // Dispatch to global listeners
        this.globalListeners.forEach((listener) => listener(event));

        // Dispatch to specific listeners
        if (this.listeners.has(event.type)) {
            this.listeners.get(event.type)?.forEach((listener) => listener(event));
        }
    }
}
