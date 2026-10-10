import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/druzinski-nakupovalni-seznam/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png', 'pwa-192x192.svg', 'pwa-512x512.svg', 'logos/*.svg'],
      manifest: {
        id: '/druzinski-nakupovalni-seznam/?v=3',
        start_url: '/druzinski-nakupovalni-seznam/',
        scope: '/druzinski-nakupovalni-seznam/',
        name: 'Družinski Nakupovalni Seznam',
        short_name: 'Družinski Seznam',
        description: 'Pametni družinski nakupovalni seznam z analizo akcij slovenskih trgovcev in PIN zaščito',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/logos/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'store-logos-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dni
              }
            }
          }
        ]
      }
    })
  ],
})
