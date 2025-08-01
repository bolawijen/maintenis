<script lang="ts">
    export let indicatorSize: number = 40;

    $: sizePx = `${indicatorSize}px`;
    $: marginPx = `${-indicatorSize / 2}px`;
</script>

<div class="full-screen-progress-container">
    <div class="circular-progress" style="width: {sizePx}; height: {sizePx}; margin-top: {marginPx}; margin-left: {marginPx};">
        <div class="spinner"></div>
    </div>
</div>

<style>
    .full-screen-progress-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); /* Center the container */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .circular-progress {
        position: relative;
        display: inline-block;
    }

    .spinner {
        width: 100%;
        height: 100%;
        border: 3px solid #f3f3f3; /* Light grey */
        border-top: 3px solid #3498db; /* Blue */
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>
