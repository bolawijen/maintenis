<script>
  import { params } from '@roxi/routify';
  import { createSseConnection, EventTypesEnum } from '../../../../lib/sse'; // Import SSE utilities

  let id = $state($params.id);
  let collector = $state($params.collector);
  let logEntry = $state(null);
  let logs = $state([]);
  let errorMessage = $state('');

  $effect(() => {
    if (id) {
      fetchLogDetails(collector, id);

      let sseObserver = null;
      let unsubscribeSse = null;

      // Only establish SSE connection if viewing the all logs panel
      if (collector === 'log' && id === 'bun-logs-debug-entry') {
        const { observer, messageStore, handler } = createSseConnection(process.env.PUB_TAPAK_BASE_URL);
        sseObserver = observer;

        unsubscribeSse = messageStore.subscribe(message => {
          if (message && message.type === EventTypesEnum.LogUpdated && message.payload) {
            logs.unshift(message.payload);
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
    }
  });

  async function fetchLogDetails(currentCollector, currentId) {
    errorMessage = '';
    logEntry = null;
    logs = []; // Clear both

    try {
      let response;
      if (currentCollector === 'log' && currentId === 'bun-logs-debug-entry') {
        // Fetch all logs for the LogPanel view
        response = await fetch(`${process.env.PUB_TAPAK_BASE_URL}/http-traffic/log/bun-logs-debug-entry`);
      } else {
        // Fetch single log entry for other cases
        response = await fetch(`${process.env.PUB_TAPAK_BASE_URL}/view/${currentId}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (currentCollector === 'log' && currentId === 'bun-logs-debug-entry') {
        if (Array.isArray(data)) {
          logs = data; // No sorting here
        } else {
          errorMessage = 'Invalid data format received for log list.';
        }
      } else {
        if (data.data) {
          logEntry = data.data; // Expecting a single log entry
        } else {
          errorMessage = 'Log entry not found.';
        }
      }
    } catch (error) {
      console.error('Error fetching log details:', error);
      errorMessage = `Failed to load log details: ${error.message}`;
    }
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
            <th>Timestamp</th>
            <th>Level</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {#each logs as log (log.id)}
            <tr style="{getLogLevelStyles(log.level)}">
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>{log.level}</td>
              <td>{log.message}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>No logs found.</p>
    {/if}
  {:else if logEntry}
    <h2>Log Detail for ID: {id} (Collector: {collector})</h2>
    <div class="log-detail-item">
      <span class="log-detail-label">Timestamp:</span> {new Date(logEntry.time).toLocaleString()}
    </div>
    <div class="log-detail-item">
      <span class="log-detail-label">Level:</span> {logEntry.level}
    </div>
    <div class="log-detail-item">
      <span class="log-detail-label">Message:</span> {logEntry.message}
    </div>
    <!-- Add more details as needed -->
  {:else}
    <p>Loading...</p>
  {/if}
</div>
