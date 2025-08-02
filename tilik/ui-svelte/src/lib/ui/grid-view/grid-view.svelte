<script>
    import { onMount } from "svelte";
    import Spinner from "../spinner.svelte";

    let table
    let columnLen = $state()
    let { dataFetcher: data, buttons, columns, filters, dataRow } = $props()

    data.fetch()

    onMount(() => {
        columnLen = table.querySelectorAll('th').length
    })
</script>

<div class="table-responsive">
    {#if buttons}
        {@render buttons()}<br />
    {/if}

    <figure>
        <table bind:this={table} class="stripes {data.ready || data.rows.length || 'center-align'}">
            <thead onclick={(e) => data.sortBy(e.target.dataset.key)}>
                <!-- {#if typeof columns === 'function'} -->
                    {@render columns()}
                <!-- {/if} -->
            </thead>
            {#if filters}
                {@render filters?.()}<br />
            {/if}
            <tbody>
                {#each data.rows as row, index}
                    <!-- {#if typeof dataRow === 'function'} -->
                        {@render dataRow(row, index)}
                    <!-- {/if} -->
                {:else}
                    <tr><td colspan={columnLen}>
                        <div class="chip vertical">
                            <Spinner paused={data.ready} text="Loading" pausedText="No data"/>
                        </div>
                    </td></tr>
                {/each}
            </tbody>
        </table>

        {#if !data.ready && data.rows.length}
            <div class="center-align" style="top: -50vh;">
                <div class="chip vertical">
                    <Spinner text="Loading"/>
                </div>
            </div>
        {/if}
    </figure>
</div>

<style>
    :global(thead th) {
        cursor: pointer;
    }
</style>
