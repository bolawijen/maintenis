<script>
  import { page } from '@roxi/routify';

  let collector;

  $effect(() => { // Use effect rune
    if ($page && $page.params) {
      collector = $page.params.collector;
    }
  });
</script>

<h1>Collector: {collector}</h1>

<slot />