<script lang="ts">
    export let label: string | number | undefined;
    export let icon: any | undefined; // Svelte doesn't have ReactElement, so use any for now
    export let color: string | undefined; // Use string for CSS color

    // Map color prop to CSS class or inline style
    $: chipColorClass = color ? `chip-${color}` : '';
</script>

<div class="debug-chip {chipColorClass}">
    {#if icon}
        <span class="chip-icon">{@html icon}</span>
    {/if}
    {#if label}
        <span class="chip-label">{label}</span>
    {/if}
</div>

<style>
    .debug-chip {
        display: inline-flex;
        align-items: center;
        padding: 0 12px;
        height: 32px;
        font-size: 0.8125rem;
        border-radius: 16px; /* Default Material UI chip border-radius */
        background-color: #e0e0e0; /* Default gray background */
        color: rgba(0, 0, 0, 0.87); /* Default text color */
        margin: 0 2px;
        vertical-align: middle;
    }

    .chip-icon {
        display: flex;
        margin-right: 4px;
        font-size: 1.125rem; /* Adjust icon size */
    }

    .chip-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Basic color mapping - extend as needed */
    .chip-primary {
        background-color: #1976d2;
        color: #fff;
    }
    .chip-secondary {
        background-color: #dc004e;
        color: #fff;
    }
    .chip-error {
        background-color: #d32f2f;
        color: #fff;
    }
    .chip-warning {
        background-color: #ff9800;
        color: rgba(0, 0, 0, 0.87);
    }
    .chip-info {
        background-color: #2196f3;
        color: #fff;
    }
    .chip-success {
        background-color: #4caf50;
        color: #fff;
    }
</style>
