<script lang="ts">
  import { params } from '@roxi/routify';
  import { createSseConnection, EventTypesEnum } from '../../../../lib/sse'; // Import SSE utilities
  import { localWritable } from '@macfja/svelte-persistent-store';
  import { fetchLogDetails, goToPage, nextPage, prevPage, getLogLevelStyles } from './functions';

  let id = $state($params.id);
  let collector = $state($params.collector);
  let logEntry = $state(null);
  let logs = $state([]);
  let errorMessage = $state('');

  // Pagination state
  let currentPage = localWritable('app.pagination.currentPage', 1);
  const perPage = localWritable('app.pagination.perPage', 30);
  let totalLogs = $state(0);
  let newLogsCount = $state(0);

  // Helper functions to update state
  function updateErrorMessage(msg) {
    errorMessage = msg;
  }
  function updateLogEntry(entry) {
    logEntry = entry;
  }
  function updateLogs(newLogs) {
    logs = newLogs;
  }
  function updateTotalLogs(total) {
    totalLogs = total;
  }
  function updateNewLogsCount(count) {
    newLogsCount = count;
  }


  // Effect for fetching log details (pagination)
  $effect(() => {
    if (id) {
      fetchLogDetails(
        collector,
        id,
        $currentPage,
        $perPage,
        updateErrorMessage,
        updateLogEntry,
        updateLogs,
        updateTotalLogs,
        updateNewLogsCount
      );
    }
  });

  // Effect for SSE connection
  $effect(() => {
    let sseObserver = null;
    let unsubscribeSse = null;

    // Only establish SSE connection if viewing the all logs panel
    if (collector === 'log' && id === 'bun-logs-debug-entry') {
      const { observer, messageStore, handler } = createSseConnection(process.env.PUB_TAPAK_BASE_URL);
      sseObserver = observer;

      unsubscribeSse = messageStore.subscribe(message => {
        if (message && message.type === EventTypesEnum.LogUpdated && message.payload) {
          if ($currentPage === 1) {
            logs.pop();
            logs.unshift(message.payload);
            totalLogs++;
            newLogsCount = 0; // Reset count if on first page
          } else {
            newLogsCount++; // Increment count if not on first page
          }
        }
      });
    }

    return () => {
      if (unsubscribeSse) {
        unsubscribeSse();
      }
      if (sseObserver) {
        sseObserver.close();
      }
    };
  });

  // Helper functions for pagination controls
  function handleGoToPage(page: number) {
    goToPage(page, currentPage, (count) => (newLogsCount = count), totalLogs, $perPage);
  }

  function handleNextPage() {
    nextPage($currentPage, currentPage, (count) => (newLogsCount = count), totalLogs, $perPage);
  }

  function handlePrevPage() {
    prevPage($currentPage, currentPage, (count) => (newLogsCount = count), totalLogs, $perPage);
  }
</script>

<style>
  /* Existing styles */
  .log-detail-container {
    padding: 20px;
    background-color: #f0f0f0;
    border-radius: 8px;
    margin-top: 20px;
  }
  .log-detail-item {
    margin-bottom: 10px;
  }
  .log-detail-label {
    font-weight: bold;
    margin-right: 5px;
  }
  .error-message {
    color: red;
    font-weight: bold;
  }

  /* New styles for table */
  .log-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  .log-table th, .log-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  .log-table th {
    background-color: #e9ecef;
    font-weight: bold;
  }
  .log-table tbody tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  .log-table tbody tr:hover {
    background-color: #e2e6ea;
  }

  .pagination-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 10px;
    background-color: #e9ecef;
    border-radius: 8px;
  }

  .pagination-controls button {
    padding: 8px 15px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
  }

  .pagination-controls button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .pagination-info {
    font-size: 1em;
    color: #333;
  }

  .refresh-button-container {
    margin-bottom: 10px;
    text-align: right;
  }

  .refresh-button-container button {
    padding: 8px 15px;
    border: none;
    background-color: #28a745; /* Green color for refresh */
    color: white;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
  }

  .new-logs-button {
    background-color: #ffc107; /* Yellow for new logs */
    color: #333;
    margin-right: 10px;
  }
</style>

<div class="log-detail-container">
  <h1>HTTP Traffic Detail</h1>

  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
    {:else if collector === 'log' && id === 'bun-logs-debug-entry'}
    <h2>All Logs</h2>
    <div class="refresh-button-container">
        {#if newLogsCount > 0}
            <button class="new-logs-button" onclick="{() => { handleGoToPage(1); }}">View ({newLogsCount}) New Logs</button>
        {/if}
        <button onclick="{() => fetchLogDetails(collector, id, $currentPage, $perPage, updateErrorMessage, updateLogEntry, updateLogs, updateTotalLogs, updateNewLogsCount)}">Refresh</button>
    </div>
    {#if logs.length > 0}
      <table class="log-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Timestamp</th>
            <th>Level</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {#each logs as log, index (log.id)}
            <tr style="{getLogLevelStyles(log.level)}">
              <td>{($currentPage - 1) * $perPage + index + 1}</td>
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>{log.level}</td>
              <td>{log.message}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="pagination-controls">
        <button onclick="{handlePrevPage}" disabled="{$currentPage === 1}">Previous</button>
        <span class="pagination-info">Page {$currentPage} of {Math.ceil(totalLogs / $perPage)} ({totalLogs} logs total)</span>
        <button onclick="{handleNextPage}" disabled="{$currentPage * $perPage >= totalLogs}">Next</button>
      </div>
    {:else}
      <p>No logs found.</p>
    {/if}
  {:else if logEntry}
    <h2>Log Detail for ID: {id} (Collector: {collector})</h2>
    <div class="log-detail-item">
      <span class="log-detail-label">Timestamp:</span> {new Date(logEntry.time).toLocaleString()}</div>
    <div class="log-detail-item">
      <span class="log-detail-label">Level:</span> {logEntry.level}</div>
    <div class="log-detail-item">
      <span class="log-detail-label">Message:</span> {logEntry.message}</div>
    <!-- Add more details as needed -->
  {:else}
    <p>Loading...</p>
  {/if}
</div>