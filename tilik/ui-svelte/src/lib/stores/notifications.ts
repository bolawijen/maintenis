import { writable } from 'svelte/store';

type Notification = {
    title?: string;
    text: string;
    color: 'error' | 'info' | 'success' | 'warning'; // Simplified AlertColor to common types
    shown: boolean;
    id: number; // Add an ID for unique identification
};

let nextNotificationId = 0;

const { subscribe, update } = writable<Notification[]>([]);

export const notifications = {
    subscribe,
    addNotification: (notification: Omit<Notification, 'shown' | 'id'>) => {
        update(n => [...n, { ...notification, shown: true, id: nextNotificationId++ }]);
    },
    removeNotification: (id: number) => {
        update(n => n.map(notif => (notif.id === id ? { ...notif, shown: false } : notif)));
    },
    // Optional: a way to truly remove from the array after animation
    clearNotification: (id: number) => {
        update(n => n.filter(notif => notif.id !== id));
    }
};
