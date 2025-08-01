import { SveltePlugin } from 'bun-plugin-svelte';

Bun.plugin(SveltePlugin({
    // development: false,
    compilerOptions: {
        compatibility: '5.x'
    }
}))
