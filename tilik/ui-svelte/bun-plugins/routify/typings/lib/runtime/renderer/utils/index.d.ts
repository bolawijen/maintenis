export function attachProps<C extends typeof import("svelte/internal").SvelteComponentDev>(Component: C, props: {
    [x: string]: any;
}, defaults: any): C;
export function getLineage(context: RenderContext): import("../RenderContext").RenderContext[];
