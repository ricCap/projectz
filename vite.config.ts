import solidPlugin from 'vite-plugin-solid'

// yarn add --dev @esbuild-plugins/node-globals-polyfill
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// yarn add --dev @esbuild-plugins/node-modules-polyfill
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

import nodePolyfills from 'rollup-plugin-polyfill-node'

export default {
  base: '/projectz/',
  plugins: [solidPlugin()],
  server: {
    host: 'localhost',
    port: 3000,
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        nodePolyfills(),
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
}
