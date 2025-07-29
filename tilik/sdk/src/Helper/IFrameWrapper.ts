import {
    CrossWindowEventType,
    CrossWindowValueType,
    dispatchWindowEvent,
} from './dispatchWindowEvent';
import {Queue} from './queue';

export class IFrameWrapper {
    private eventQueue = new Queue();

    constructor(public frame: HTMLIFrameElement) {
        window.addEventListener('message', (e) => {
            // console.log('from iframe event', e);
            if ('event' in e.data) {
                switch (e.data.event as CrossWindowEventType) {
                    case 'panel.loaded':
                        this.eventQueue.ready();
                        break;
                }
            }
        });
    }

    dispatchEvent(event: CrossWindowEventType, value: CrossWindowValueType) {
        this.eventQueue.next(() => {
            if (this.frame.contentWindow) {
                dispatchWindowEvent(this.frame.contentWindow, event, value);
            }
        });
    }
}
