import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    optimizeDeps: {
        include: [
            '@kangc/v-md-editor',
            '@kangc/v-md-editor/lib/preview',
            '@kangc/v-md-editor/lib/theme/github.js'
        ],
    },
    server: {
        port: 5173,
        host: '0.0.0.0',
        hmr: {
            port: 5173,
            protocol: 'ws',
            host: 'localhost'
        }
    }
})