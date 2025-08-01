<script>
  import { page } from '@roxi/routify';

  let id;

  $effect(() => { // Use effect rune
    if ($page && $page.params) {
      id = $page.params.id;
    }
  });
</script>

<slot />