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
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'icons/*.png', 'logos/*.svg'],
      manifest: {
        // Popolnoma nov enolični ID in start_url, da se pretrga povezava s starim WebAPK-jem:
        id: 'druzinski-nakupovalni-seznam-v3',
        name: 'Družinski Nakupovalni Seznam',
        short_name: 'Družinski Seznam',
        description: 'Pametni družinski nakupovalni seznam in akcije trgovin',
        theme_color: '#059669',
        background_color: '#f8fafc',
        display: 'standalone', // KLJUČNO: odstrani URL vrstico brskalnika
        display_override: ['standalone', 'window-controls-overlay'],
        orientation: 'portrait',
        start_url: '/druzinski-nakupovalni-seznam/?pwa=v3',
        scope: '/druzinski-nakupovalni-seznam/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
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
  ]
})
