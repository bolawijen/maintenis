<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    export let bottomOffset: boolean = false;

    let showButton = false;

    function handleScroll() {
        showButton = window.scrollY > 100;
    }

    function handleClick() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onMount(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });
</script>

{#if showButton}
    <div
        on:click={handleClick}
        role="presentation"
        class="scroll-top-button"
        style="bottom: {bottomOffset ? 68 : 18}px;"
    >
        <button class="fab-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
        </button>
    </div>
{/if}

<style>
    .scroll-top-button {
        position: fixed;
        right: 16px;
        z-index: 100;
        cursor: pointer;
        transition: opacity 0.3s ease-in-out;
    }

    .fab-button {
        background-color: #f5f5f5; /* Light gray, similar to MUI Fab */
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12); /* Basic shadow */
        border: none;
        cursor: pointer;
    }

    .fab-button svg {
        fill: rgba(0, 0, 0, 0.54); /* Default icon color */
    }
</style>
