import { Router } from '@roxi/routify';
import routes from '../.routify/routes.custom.js';
import { hydrate, mount } from 'svelte';

mount(Router, {
  target: document.body,
  props: { routes }
});
