

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
      "meta": {},
      "id": "_default_http_traffic",
      "name": "http-traffic",
      "file": {
        "path": "src/features/http-traffic",
        "dir": "src/features",
        "base": "http-traffic",
        "ext": "",
        "name": "http-traffic"
      },
      "children": [
        {
          "meta": {
            "isDefault": true
          },
          "id": "_default_http_traffic_index_svelte",
          "name": "index",
          "file": {
            "path": "src/features/http-traffic/index.svelte",
            "dir": "src/features/http-traffic",
            "base": "index.svelte",
            "ext": ".svelte",
            "name": "index"
          },
          "asyncModule": () => import('../src/features/http-traffic/index.svelte'),
          "children": []
        },
        {
          "meta": {"dynamic": true},
          "id": "_default_http_traffic_collector",
          "name": "[collector]",
          "file": {
            "path": "src/features/http-traffic/[collector].svelte",
            "dir": "src/features/http-traffic",
            "base": "[collector].svelte",
            "ext": ".svelte",
            "name": "[collector]"
          },
          "asyncModule": () => import('../src/features/http-traffic/[collector].svelte'),
          "children": [
            {
              "meta": {"dynamic": true},
              "id": "_default_http_traffic_collector_id",
              "name": "[id]",
              "file": {
                "path": "src/features/http-traffic/[collector]/[id].svelte",
                "dir": "src/features/http-traffic/[collector]",
                "base": "[id].svelte",
                "ext": ".svelte",
                "name": "[id]"
              },
              "asyncModule": () => import('../src/features/http-traffic/[collector]/[id].svelte'),
              "children": [
                {
                  "meta": {},
                  "id": "_default_http_traffic_collector_id_view_svelte",
                  "name": "view",
                  "file": {
                    "path": "src/features/http-traffic/[collector]/[id]/view.svelte",
                    "dir": "src/features/http-traffic/[collector]/[id]",
                    "base": "view.svelte",
                    "ext": ".svelte",
                    "name": "view"
                  },
                  "asyncModule": () => import('../src/features/http-traffic/[collector]/[id]/view.svelte'),
                  "children": []
                }
              ]
            }
          ]
        }
      ]
    },
  ]
}
export default routes