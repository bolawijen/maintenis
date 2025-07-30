import {EventSourceSseObserver} from './EventSourceSseObserver';
import {FetchSseObserver} from './FetchSseObserver';
import {useEffect, useRef} from 'react';


type SseObserver = (FetchSseObserver | EventSourceSseObserver) & {
    (url: string): void
};

const clients: Map<typeof fetch, FetchSseObserver> | Map<typeof EventSource, EventSourceSseObserver> = new Map()

clients.set(EventSource as any, EventSourceSseObserver as never)
clients.set(fetch as any, FetchSseObserver as never)

type DebugUpdatedType = string;

export enum EventTypesEnum {
    Connected = 'connected',
    DebugUpdated = 'debug-updated',
    LogUpdated = 'log-updated',
}

export type EventTypes = DebugUpdatedType;

export type EventMessage = {
    type: string;
    payload: any;
};

export const useServerSentEvents = (
    backendUrl: string,
    onMessage: (message: EventMessage) => void,
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
        const handler = (event: MessageEvent<EventTypes>) => {
            const message = JSON.parse(event.data) as EventMessage;
            if (message.type !== EventTypesEnum.Connected) {
                messageHandlerRef.current(message);
            }
        }

        currentObserver?.subscribe(handler);

        return () => {
            currentObserver?.unsubscribe(handler);
        };
    }, [backendUrl, subscribe, client]);
};