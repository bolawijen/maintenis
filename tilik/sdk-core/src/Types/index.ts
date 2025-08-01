export enum EventTypesEnum {
    Connected = 'connected',
    DebugUpdated = 'debug-updated',
    LogUpdated = 'log-updated',
}

// Define specific payload types
type ConnectedPayload = undefined;
type LogUpdatedPayload = any; // This will be the LogEntry object directly
type DebugUpdatedPayload = any; // Assuming DebugUpdated still has a payload

// Define the message structure for the callback
export type SseCallbackMessage =
    | { type: EventTypesEnum.Connected; payload: ConnectedPayload }
    | { type: EventTypesEnum.LogUpdated; payload: LogUpdatedPayload }
    | { type: EventTypesEnum.DebugUpdated; payload: DebugUpdatedPayload };

export * from './Debug';