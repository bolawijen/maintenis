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

export type EventTypes = EventTypesEnum;

// Define specific payload types
type ConnectedPayload = undefined;
type LogUpdatedPayload = any; // This will be the LogEntry object directly
type DebugUpdatedPayload = any; // Assuming DebugUpdated still has a payload

// Define the message structure for the callback
export type SseCallbackMessage =
    | { type: EventTypesEnum.Connected; payload: ConnectedPayload }
    | { type: EventTypesEnum.LogUpdated; payload: LogUpdatedPayload }
    | { type: EventTypesEnum.DebugUpdated; payload: DebugUpdatedPayload };

export const useServerSentEvents = (
    backendUrl: string,
    onMessage: (message: SseCallbackMessage) => void,
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
        const handler = (event: MessageEvent) => {
            let payload: any = undefined;
            if (event.data) {
                try {
                    payload = JSON.parse(event.data);
                } catch (e) {
                    console.warn(`[useServerSentEvents] Could not parse event data as JSON for type ${event.type}:`, event.data, e);
                }
            }

            const message: SseCallbackMessage = {
                type: event.type as EventTypesEnum,
                payload: payload,
            };

            messageHandlerRef.current(message);
        }

        // Subscribe to all relevant event types
        Object.values(EventTypesEnum).forEach(eventType => {
            currentObserver?.subscribe(eventType, handler);
        });

        // Also subscribe to 'message' for general events or fallback
        // currentObserver?.subscribe('message', handler);

        return () => {
            // Unsubscribe from all relevant event types
            Object.values(EventTypesEnum).forEach(eventType => {
                currentObserver?.unsubscribe(eventType, handler);
            });
            // currentObserver?.unsubscribe('message', handler);
        };
    }, [backendUrl, subscribe, client]);
};