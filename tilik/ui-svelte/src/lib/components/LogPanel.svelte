<script lang="ts">
    export let data: LogEntry[];

    type Level = 'error' | 'info' | 'debug' | 'warn';
    type LogEntry = {
        context: object;
        level: Level;
        line: string;
        message: string;
        time: number;
    };

    const getLogLevelStyles = (level: Level) => {
        switch (level) {
            case 'debug':
                return { color: 'rgb(54, 96, 146)' };
            case 'info':
                return { color: 'rgb(0, 125, 60)' };
            case 'warn':
                return { color: 'rgb(225, 125, 50)' };
            case 'error':
                return { color: 'rgb(240, 0, 0)' };
            default:
                return {};
        }
    };
</script>

<div class="log-panel">
    {#if !data || data.length === 0}
        <div class="alert info">
            <h3>No logs found during the process</h3>
        </div>
    {:else}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data as entry, index (index)}
                        <tr style="color: {getLogLevelStyles(entry.level).color};">
                            <td>{new Date(entry.time).toLocaleString()}</td>
                            <td>{entry.level}</td>
                            <td>{entry.message}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<style>
    .log-panel {
        margin: 20px;
    }
    .alert {
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
    }
    .alert.info {
        background-color: #e0f7fa;
        border: 1px solid #00bcd4;
        color: #006064;
    }
    .table-container {
        overflow-x: auto;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    tr:hover {
        background-color: #f1f1f1;
    }
</style>
