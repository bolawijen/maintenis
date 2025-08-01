<script lang="ts">
    export let error: Error;
    export let resetErrorBoundary: () => void;

    let showStackTrace = false;

    function toggleStackTrace() {
        showStackTrace = !showStackTrace;
    }
</script>

<div class="error-fallback">
    <div class="alert error">
        <div class="alert-title">Something went wrong:</div>
        <pre>{error.message}</pre>

        <button class="accordion-header" on:click={toggleStackTrace}>
            Stack Trace {showStackTrace ? '▲' : '▼'}
        </button>
        {#if showStackTrace}
            <div class="accordion-details">
                <pre>{error.stack?.toString()}</pre>
            </div>
        {/if}

        <button class="try-again-button" on:click={resetErrorBoundary}>
            Try again
        </button>
    </div>
</div>

<style>
    .error-fallback {
        margin-top: 16px;
        padding: 20px;
        font-family: sans-serif;
    }

    .alert.error {
        background-color: #ffebee; /* Light red */
        border: 1px solid #ef9a9a; /* Red border */
        color: #d32f2f; /* Dark red text */
        padding: 15px;
        border-radius: 4px;
    }

    .alert-title {
        font-weight: bold;
        margin-bottom: 8px;
    }

    pre {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 10px;
        border-radius: 4px;
        white-space: pre-wrap;
        word-break: break-all;
        margin-top: 10px;
        margin-bottom: 10px;
        font-size: 0.875rem;
    }

    .accordion-header {
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        padding: 10px;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-weight: bold;
        margin-top: 10px;
        border-radius: 4px;
    }

    .accordion-details {
        border: 1px solid #ddd;
        border-top: none;
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 0 0 4px 4px;
    }

    .try-again-button {
        background-color: #d32f2f; /* Red */
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 15px;
        font-size: 1rem;
    }

    .try-again-button:hover {
        background-color: #c62828;
    }
</style>
