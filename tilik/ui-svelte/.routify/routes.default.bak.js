

export const routes = {
  "meta": {},
  "id": "_default",
  "name": "",
  "file": {
    "path": "src/routes",
    "dir": "src",
    "base": "routes",
    "ext": "",
    "name": "routes"
  },
  "rootName": "default",
  "routifyDir": import.meta.url,
  "children": [
    // {
    //   "meta": {},
    //   "id": "_default_hello_world_svelte",
    //   "name": "hello-world",
    //   "file": {
    //     "path": "src/routes/hello-world.svelte",
    //     "dir": "src/routes",
    //     "base": "hello-world.svelte",
    //     "ext": ".svelte",
    //     "name": "hello-world"
    //   },
    //   "asyncModule": () => import('../src/routes/hello-world.svelte'),
    //   "children": []
    // },
    {
      "meta": {
        "isDefault": true
      },
      "id": "_default_index_svelte",
      "name": "http-traffic",
      "file": {
        "path": "src/features/http-traffic/index.svelte",
        "dir": "src/features",
        "base": "index.svelte",
        "ext": ".svelte",
        "name": "index"
      },
      "asyncModule": () => import('../src/features/http-traffic/index.svelte'),
      "children": []
    },
  ]
}
export default routes