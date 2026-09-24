// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nuvellab.cloud',
  // Short link used in the WhatsApp consent notice and the dashboard.
  redirects: {
    '/privacidad': '/politica-de-tratamiento-de-datos',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
