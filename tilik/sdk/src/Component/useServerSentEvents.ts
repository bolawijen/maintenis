import {EventSourceSseObserver} from './EventSourceSseObserver';
import {FetchSseObserver} from './FetchSseObserver';
import {useEffect, useRef} from 'react';


type SseObserver = (FetchSseObserver | EventSourceSseObserver) & {
    (url: string): void
};

const clients: Map<typeof fetch, FetchSseObserver> | Map<typeof EventSource, EventSourceSseObserver> = new Map()

clients.set(EventSource as any, EventSourceSseObserver as never)
clients.set(fetch as any, FetchSseObserver as never)

type DebugUpdatedType = {
    type: EventTypesEnum.DebugUpdated;
    payload: {};
};

export enum EventTypesEnum {
    DebugUpdated = 'debug-updated',
}

export type EventTypes = DebugUpdatedType;

export const useServerSentEvents = (
    backendUrl: string,
    onMessage: (event: MessageEvent<EventTypes>) => void,
    subscribe: boolean,
    client: typeof fetch | typeof EventSource = fetch,
) => {
    const observerRef = useRef<SseObserver | null>(null);
    const messageHandlerRef = useRef(onMessage);
    const SseClient = clients.get(client as any) as SseObserver;

    backendUrl += '/debug/api/event-stream';

    // Update the message handler ref if onMessage changes
    useEffect(() => {
        messageHandlerRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        if (!backendUrl || !subscribe) {
            if (observerRef.current) {
                observerRef.current.close();
                observerRef.current = null;
            }
            return;
        }

        if (!observerRef.current) {
            observerRef.current = new SseClient(backendUrl);
        } else if (observerRef.current.client !== client) {
            observerRef.current.close();
            observerRef.current = new SseClient(backendUrl);
        }

        const currentObserver = observerRef.current;
        const handler = (event: MessageEvent<EventTypes>) => messageHandlerRef.current(event);

        currentObserver?.subscribe(handler);

        return () => {
            currentObserver?.unsubscribe(handler);
        };
    }, [backendUrl, subscribe, client]);
};