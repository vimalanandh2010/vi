import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
        },
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api\/api/, '/api')
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true,
                changeOrigin: true
            },
        },
    },
    build: {
        sourcemap: false,
        minify: 'esbuild',
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
})
