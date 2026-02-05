import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tambahkan bagian build ini
  build: {
    chunkSizeWarningLimit: 1000, // Opsional: Menaikkan limit warning jadi 1000 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Memisahkan library charting yang besar
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // Memisahkan library PDF
            if (id.includes('jspdf')) {
              return 'jspdf';
            }
            // Memisahkan Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // Memisahkan library UI (Radix & Lucide) agar tidak menyatu dengan core logic
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-components';
            }

            // Sisanya masuk ke vendor chunk biasa
            return 'vendor';
          }
        },
      },
    },
  },
}));