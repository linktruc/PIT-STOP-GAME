import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', testTimeout: 30000, fileParallelism: false },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: { output: { manualChunks: { three: ['three'], vendor: ['react', 'react-dom'], supabase: ['@supabase/supabase-js'] } } }
  }
});
