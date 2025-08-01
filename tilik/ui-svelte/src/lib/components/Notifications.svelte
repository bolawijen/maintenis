<script lang="ts">
    import { notifications } from '../stores/notifications';
    import { fade } from 'svelte/transition';

    // Local variable to hold the notifications from the store
    let currentNotifications: Notification[] = [];

    // Subscribe to the store
    notifications.subscribe(value => {
        currentNotifications = value;
    });

    function handleClose(id: number) {
        notifications.removeNotification(id);
        // After a short delay (e.g., for fade-out animation), truly remove it
        setTimeout(() => {
            notifications.clearNotification(id);
        }, 300); // Match with fade transition duration
    }
</script>

<div class="notifications-container">
    {#each currentNotifications as notification (notification.id)}
        {#if notification.shown}
            <div
                class="notification-item notification-{notification.color}"
                transition:fade={{ duration: 300 }}
            >
                {#if notification.title}
                    <div class="notification-title">{notification.title}</div>
                {/if}
                <div class="notification-text">{notification.text}</div>
                <button class="notification-close-button" on:click={() => handleClose(notification.id)}>
                    &times;
                </button>
            </div>
        {/if}
    {/each}
</div>

<style>
    .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .notification-item {
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 250px;
        max-width: 350px;
        font-family: sans-serif;
        position: relative;
    }

    .notification-title {
        font-weight: bold;
        margin-bottom: 5px;
    }

    .notification-text {
        flex-grow: 1;
    }

    .notification-close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: inherit;
        margin-left: 15px;
        line-height: 1;
    }

    /* Colors based on severity */
    .notification-error {
        background-color: #ffebee;
        border: 1px solid #ef9a9a;
        color: #d32f2f;
    }

    .notification-info {
        background-color: #e3f2fd;
        border: 1px solid #90caf9;
        color: #2196f3;
    }

    .notification-success {
        background-color: #e8f5e9;
        border: 1px solid #a5d6a7;
        color: #4caf50;
    }

    .notification-warning {
        background-color: #fffde7;
        border: 1px solid #ffcc80;
        color: #ff9800;
    }
</style>
