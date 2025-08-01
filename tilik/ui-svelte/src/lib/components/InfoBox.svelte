<script lang="ts">
    export let title: string;
    export let text: string | any; // Can be string or Svelte component/HTML
    export let severity: 'error' | 'info';
    export let icon: any; // Svelte doesn't have ReactElement, so use any for now

    // Reactive class for severity
    $: alertClass = `alert-${severity}`;
</script>

<div class="info-box">
    <div class="icon-container" style="color: {severity === 'error' ? '#d32f2f' : '#2196f3'};">
        {@html icon} <!-- Render icon as HTML -->
    </div>
    <h3>{title}</h3>
    {#if text}
        <div class="alert {alertClass}">
            {#if typeof text === 'string'}
                <p>{text}</p>
            {:else}
                {@render text()} <!-- Render as Svelte snippet or component -->
            {/if}
        </div>
    {/if}
</div>

<style>
    .info-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
    }

    .icon-container {
        margin-bottom: 15px;
        font-size: 150px; /* Adjust icon size */
        line-height: 1;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.5rem;
        text-align: center;
    }

    .alert {
        padding: 10px 15px;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
    }

    .alert-error {
        background-color: #ffebee; /* Light red */
        border: 1px solid #ef9a9a; /* Red border */
        color: #d32f2f; /* Dark red text */
    }

    .alert-info {
        background-color: #e3f2fd; /* Light blue */
        border: 1px solid #90caf9; /* Blue border */
        color: #2196f3; /* Dark blue text */
    }

    .alert p {
        margin: 0;
    }
</style>
