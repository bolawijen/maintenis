// TODO support custom events and decode payload to object
export class EventSourceSseObserver {
    public readonly client = EventSource;
    private eventSource: EventSource | null = null;
    private listeners: ((event: MessageEvent) => void)[] = [];
    constructor(public url: string) { }

    subscribe(subscriber: (event: MessageEvent) => void) {
        this.listeners.push(subscriber);
        if (this.eventSource === null || this.eventSource.readyState === EventSource.CLOSED) {
            this.eventSource = new EventSource(this.url);
        }
        this.eventSource.addEventListener('message', this.handle.bind(this));
    }

    unsubscribe(subscriber: (event: MessageEvent) => void) {
        this.listeners = this.listeners.filter((listener) => listener !== subscriber);
    }

    close() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource.removeEventListener('message', this.handle.bind(this));
        }
    }

    private handle(event: MessageEvent) {
        this.listeners && this.listeners.forEach((listener) => listener(event));
    }
}