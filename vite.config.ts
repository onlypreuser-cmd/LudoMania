import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'three-fiber': ['@react-three/fiber', '@react-three/drei'],
          'anim-vendor': ['gsap', 'framer-motion'],
          'state-vendor': ['@xstate/react', 'xstate', 'zustand'],
        },
      },
    },
  },
});
