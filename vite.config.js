import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    host: true,         // listen on all interfaces
    port: 4200,
    strictPort: true,
    allowedHosts: 'all' // <-- allow all hosts, including subdomains
  }
});
