import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'remove-crossorigin-css',
      transformIndexHtml(html) {
        return html.replace(/<link rel="stylesheet" crossorigin/g, '<link rel="stylesheet"');
      }
    }
  ],
  server: {
    host: true,
    port: 3000,
    cors: true,
    allowedHosts: true,
    watch: {
      ignored: ['**/*.zip', '**/test-*/**', '**/.git/**']
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
