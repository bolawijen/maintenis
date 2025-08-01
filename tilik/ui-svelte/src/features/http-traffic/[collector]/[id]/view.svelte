<script>
  import { params } from '@roxi/routify';
  import { createSseConnection, EventTypesEnum } from '../../../../lib/sse'; // Import SSE utilities

  let id = $state($params.id);
  let collector = $state($params.collector);
  let logEntry = $state(null);
  let logs = $state([]);
  let errorMessage = $state('');

  // Pagination state
  let currentPage = $state(1);
  const perPage = 30;
  let totalLogs = $state(0);

  // Effect for fetching log details (pagination)
  $effect(() => {
    if (id) {
      fetchLogDetails(collector, id, currentPage, perPage);
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
          // For real-time updates, we might want to add to the beginning
          // or re-fetch the current page to include the new log.
          // For now, let's just add it if it's on the first page.
          if (currentPage === 1) {
            logs.pop();
            logs.unshift(message.payload);
            // If we add a new log, the total count might change, so re-fetch totalLogs
            totalLogs++;
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

  async function fetchLogDetails(currentCollector, currentId, page, limit) {
    errorMessage = '';
    logEntry = null;
    logs = []; // Clear both

    try {
      let response;
      let requestUrl;
      if (currentCollector === 'log' && currentId === 'bun-logs-debug-entry') {
        const offset = (page - 1) * limit;
        requestUrl = `${process.env.PUB_TAPAK_BASE_URL}/http-traffic/log/bun-logs-debug-entry?limit=${limit}&offset=${offset}`;
        response = await fetch(requestUrl);
      } else {
        requestUrl = `${process.env.PUB_TAPAK_BASE_URL}/view/${currentId}`;
        response = await fetch(requestUrl);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Read X-Total-Count header for pagination
      if (currentCollector === 'log' && currentId === 'bun-logs-debug-entry') {
        const totalCountHeader = response.headers.get('X-Total-Count');
        totalLogs = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;
      }

      const data = await response.json();

      if (currentCollector === 'log' && currentId === 'bun-logs-debug-entry') {
        if (Array.isArray(data)) {
          logs = data; 
        } else {
          errorMessage = 'Invalid data format received for log list.';
        }
      } else {
        if (data.data) {
          logEntry = data.data;
        } else {
          errorMessage = 'Log entry not found.';
        }
      }
    } catch (error) {
      errorMessage = `Failed to load log details: ${error.message}`;
    }
  }

  // Pagination functions
  function goToPage(page) {
    if (page > 0 && page <= Math.ceil(totalLogs / perPage)) {
      currentPage = page;
      // fetchLogDetails(collector, id, currentPage, perPage); // Removed: $effect will handle this
    }
  }

  function nextPage() {
    goToPage(currentPage + 1);
  }

  function prevPage() {
    goToPage(currentPage - 1);
  }

  // Function to get log level styles (from React LogPanel.tsx)
  function getLogLevelStyles(level) {
    switch (level) {
      case 'error':
        return 'background-color: transparent; color: #dc3545;'; // Red
      case 'warning':
        return 'background-color: transparent; color: #ffc107;'; // Yellow
      case 'info':
        return 'background-color: transparent; color: #17a2b8;'; // Blue
      case 'debug':
        return 'background-color: transparent; color: #6c757d;'; // Gray
      default:
        return 'background-color: transparent; color: #212529;'; // Default dark
    }
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
</style>

<div class="log-detail-container">
  <h1>HTTP Traffic Detail</h1>

  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
    {:else if collector === 'log' && id === 'bun-logs-debug-entry'}
    <h2>All Logs</h2>
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
              <td>{(currentPage - 1) * perPage + index + 1}</td>
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>{log.level}</td>
              <td>{log.message}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="pagination-controls">
        <button onclick="{prevPage}" disabled="{currentPage === 1}">Previous</button>
        <span class="pagination-info">Page {currentPage} of {Math.ceil(totalLogs / perPage)} ({totalLogs} logs total)</span>
        <button onclick="{nextPage}" disabled="{currentPage * perPage >= totalLogs}">Next</button>
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
