import { EventTypesEnum, SseCallbackMessage, FetchSseObserver, EventSourceSseObserver } from '@maintenis/tilik-sdk-core';
import { writable } from 'svelte/store';

type SseObserverConstructor = (new (url: string) => FetchSseObserver) | (new (url: string) => EventSourceSseObserver);

const clients = new Map<typeof fetch | typeof EventSource, SseObserverConstructor>();

clients.set(EventSource, EventSourceSseObserver);
clients.set(fetch, FetchSseObserver);

export type EventTypes = EventTypesEnum;
export { EventTypesEnum }; // Add this line

export type { SseCallbackMessage };

export function createSseConnection(
    backendUrl: string,
    client: typeof fetch | typeof EventSource = fetch,
) {
    const messageStore = writable<SseCallbackMessage | null>(null);
    const SseClient = clients.get(client)!;
    const sseUrl = backendUrl + '/http-traffic/log-updates';
    const observer = new SseClient(sseUrl);

    const handler = (event: MessageEvent) => {
        let payload: any = undefined;
        if (event.data) {
            try {
                payload = JSON.parse(event.data);
            } catch (e) {
                // console.warn(`[createSseConnection] Could not parse event data as JSON for type ${event.type}:`, event.data, e);
            }
        }

        const message: SseCallbackMessage = {
            type: event.type as EventTypesEnum,
            payload: payload,
        };

        messageStore.set(message);
    };

    observer.subscribe('log-updated', handler);

    // Return the observer and the store
    return { observer, messageStore, handler };
}
