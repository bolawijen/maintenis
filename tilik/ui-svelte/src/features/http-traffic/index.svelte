<script>
  const httpTrafficItems = [
    { id: '123', name: 'Request to /api/users' },
    { id: '456', name: 'Request to /api/products' },
    { id: '789', name: 'Request to /api/orders' },
  ];
</script>

<h1>HTTP Traffic</h1>
<p>This is the HTTP Traffic feature.</p>

<h2>Recent Requests</h2>
<ul>
  {#each httpTrafficItems as item}
    <li>
      <a href="/http-traffic/{item.id}/view">{item.name}</a>
    </li>
  {/each}
</ul>