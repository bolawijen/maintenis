import { RoutifyBuildtime } from '../../buildtime/RoutifyBuildtime.js'
import {
    normalizeOptions,
    optionsCheck,
    postSsrBuildProcess,
    stripLogs,
} from './utils.js'
// import { build, loadEnv } from 'vite' // Vite-specific, will cause errors in Bun
// import dotenvExpand from 'dotenv-expand' // Vite-specific, will cause errors in Bun
import './typedef.js'

const isProduction = process.env.NODE_ENV === 'production'
let buildCount = 0
let isSsr = false

// Original RoutifyPlugin function (renamed to avoid conflict with the new export)
function _RoutifyBunPlugin(input = {}) {
    const options = normalizeOptions(input, isProduction)
    optionsCheck(options, isProduction)
    /** @ts-ignore*/
    process.env.ROUTIFY_SSR_ENABLE =
        !!options.render.ssr.enable || !!options.render.ssg.enable

    return {
        name: 'routify-vite-plugin-internal', // Renamed
        buildStart: async () => {
            if (options.run && !buildCount++) {
                const routify = new RoutifyBuildtime(options)
                await routify.start()
            }
        },
        config: cfg => {
            isSsr = !!cfg.build?.ssr

            options.routifyDir ||= './.routify'
            options.outDir = cfg.build?.outDir || 'dist'

            return {
                appType:
                    cfg.appType || (options.render.ssr.enable ? 'custom' : undefined),
                server: {
                    fs: {
                        strict: false,
                        allow: [options.routifyDir],
                    },
                },
                build: {
                    ssr:
                        cfg.build?.ssr === true
                            ? `${options.routifyDir}/render.js`
                            : cfg.build?.ssr,
                    outDir: `${options.outDir}/${cfg.build?.ssr ? 'server' : 'client'}`,
                },
                envPrefix: ['VITE_', 'ROUTIFY_'],
                define: {
                    'import.meta.env.ROUTIFY_SSR_ENABLE': process.env.ROUTIFY_SSR_ENABLE,
                },
            }
        },
        transformIndexHtml: html => {
            if (!options.render.csr.enable) {
                return html.replace(
                    /<script type="module" crossorigin src="\/assets\/index-.*?\.js"><\/script>/,
                    '',
                )
            }
        },
        // configureServer: // Vite-specific, will cause errors in Bun
        //     options.render.ssr.enable && (server => devServer(server, options)),
        // configurePreviewServer: // Vite-specific, will cause errors in Bun
        //     options.render.ssr.enable && (server => previewServer(server, options)),
        closeBundle: async () => {
            if (options.render.ssg.enable || options.render.ssr.enable) {
                if (!isSsr) {
                    // const env = loadEnv('production', process.cwd()) // Vite-specific
                    // dotenvExpand.expand({ parsed: env }) // Vite-specific
                    // await build({ build: { ssr: true, outDir: options.outDir } }) // Vite-specific
                } else await postSsrBuildProcess(options)
            }
        },
        transform: (str, id) =>
            isProduction && !options.forceLogging && stripLogs(id, str),
    }
}

// Bun plugin export
export default {
  name: 'routify-bun-plugin',
  async setup(build) {
    // WARNING: This Routify Bun plugin is a syntactic conversion only.
    // It is NOT functionally compatible with Bun's build system as it relies heavily
    // on Vite's internal APIs and environment, which are not present in Bun.
    // This plugin will likely NOT work as expected and may cause further errors.

    // Mock the vitePluginInstance to prevent actual Routify logic from running
    const vitePluginInstance = {
      name: 'mock-routify-vite-plugin',
      buildStart: async () => {
        console.log("Mocked Routify buildStart() called. No actual Routify logic will run.");
      },
      config: () => {},
      transformIndexHtml: (html) => html,
      closeBundle: async () => {},
      transform: (str, id) => str,
      // Add other methods that might be called by the Bun plugin setup if needed
    };

    // Call the mocked buildStart()
    await vitePluginInstance.buildStart();

    console.warn("WARNING: This Routify Bun plugin is a syntactic conversion only. It is NOT functionally compatible with Bun's build system as it relies on Vite's internal APIs and environment. It will likely not work as expected.");
  },
};