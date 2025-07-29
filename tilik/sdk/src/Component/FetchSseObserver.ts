async function* createLineReader(reader) {
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
            const res = new Uint8Array(buffer.length + arr.length);
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
            buffer = undefined; // we've finished reading it
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
        } else if (isEventSourceMessagePartId(part)) {
            message.id = part.value;
        } else if (isEventSourceMessagePartRetry(part)) {
            message.retry = part.value;
        }
    }

    if (message.data) {
        yield message;
    }
}

export class FetchSseObserver {
    public url: string;
    public readonly client = fetch;
    private controller: AbortController | null = null;
    private listeners: ((event: MessageEvent) => void)[] = [];
    private isClosed: boolean = false;
    private retryTimeout: ReturnType<typeof setTimeout> | undefined;

    constructor(url: string) {
        this.url = url;
    }

    subscribe(subscriber: (event: MessageEvent) => void) {
        this.listeners.push(subscriber);
        if (!this.controller || this.isClosed) {
            this.connect();
        }
    }

    unsubscribe(subscriber: (event: MessageEvent) => void) {
        // console.debug('FetchSseObserver.unsubscribe')
        this.listeners = this.listeners.filter((listener) => listener !== subscriber);
        // Do not close the eventSource here, it will be closed by useServerSentEvents hook
        // if (this.listeners.length === 0) {
        //     this.close();
        // }
    }

    close() {
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }
        this.isClosed = true;
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = undefined;
        }
    }

    private async connect() {
        this.isClosed = false;
        this.controller = new AbortController();
        const { signal } = this.controller;

        try {
            const response = await fetch(this.url, { signal });

            if (!response.ok || !response.body) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            for await (const message of createEventMessageReader(reader)) {
                if (this.isClosed) break; // Stop processing if closed

                if (message.retry !== undefined) {
                    // Handle retry logic if needed, though fetch-event-source usually handles it
                    // For now, we'll just log it or use it for a custom retry mechanism
                    
                }

                // Dispatch the message as a MessageEvent
                const event = new MessageEvent(message.event || 'message', {
                    data: message.data,
                    lastEventId: message.id || '',
                    origin: new URL(this.url).origin,
                });
                
                this.handle(event);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // SSE connection aborted. (No need to log debug here)
                // console.error(error);
            } else {
                // SSE connection failed. Implement retry logic if needed.
                // console.error('SSE connection failed:', error);
                if (!this.isClosed) {
                    const retryDelay = 3000; // Default retry delay
                    // console.debug(`Retrying SSE connection in ${retryDelay / 1000} seconds...`);
                    this.retryTimeout = setTimeout(() => this.connect(), retryDelay);
                }
            }
        }
    }

    private handle(event: MessageEvent) {
        this.listeners.forEach((listener) => listener(event));
    }
}