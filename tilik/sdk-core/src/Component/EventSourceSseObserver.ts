export class EventSourceSseObserver {
    public readonly client = EventSource;
    private eventSource: EventSource | null = null;
    private listeners: Map<string, Set<((event: MessageEvent) => void)>> = new Map();
    private globalListeners: Set<((event: MessageEvent) => void)> = new Set();
    constructor(public url: string) { }

    subscribe(eventType: string, subscriber: (event: MessageEvent) => void) {
        if (eventType === 'message') {
            this.globalListeners.add(subscriber);
        } else {
            if (!this.listeners.has(eventType)) {
                this.listeners.set(eventType, new Set());
            }
            this.listeners.get(eventType)?.add(subscriber);
        }

        if (this.eventSource === null || this.eventSource.readyState === EventSource.CLOSED) {
            this.eventSource = new EventSource(this.url);
            // Always listen for 'message' for default events
            this.eventSource.addEventListener('message', this.handle.bind(this));
            // Always listen for 'error'
            this.eventSource.addEventListener('error', this.handle.bind(this));
        }
        // Add listener for specific event type if not 'message'
        if (eventType !== 'message') {
            this.eventSource.addEventListener(eventType, this.handle.bind(this));
        }
    }

    unsubscribe(eventType: string, subscriber: (event: MessageEvent) => void) {
        if (eventType === 'message') {
            this.globalListeners.delete(subscriber);
        } else {
            this.listeners.get(eventType)?.delete(subscriber);
            if (this.listeners.get(eventType)?.size === 0) {
                this.listeners.delete(eventType);
                // Remove event listener from EventSource if no more subscribers for this type
                this.eventSource?.removeEventListener(eventType, this.handle.bind(this));
            }
        }
        // If no more global listeners and no more specific listeners, close the event source
        if (this.globalListeners.size === 0 && this.listeners.size === 0) {
            this.close();
        }
    }

    close() {
        if (this.eventSource) {
            this.eventSource.close();
            // Remove all listeners before closing
            this.eventSource.removeEventListener('message', this.handle.bind(this));
            this.eventSource.removeEventListener('error', this.handle.bind(this));
            this.listeners.forEach((subscribers, eventType) => {
                this.eventSource?.removeEventListener(eventType, this.handle.bind(this));
            });
            this.eventSource = null;
        }
    }

    private handle(event: MessageEvent) {
        // Dispatch to specific listeners
        this.listeners.get(event.type)?.forEach((listener) => listener(event));
        // Dispatch to global listeners
        this.globalListeners.forEach((listener) => listener(event));
    }
}