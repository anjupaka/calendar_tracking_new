import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    base: "/CalendarApplication_ENTNT/",
    
    build: {
        chunkSizeWarningLimit: 3000, // Increase limit to 1MB
        outDir: "dist",
    },
        server: {
        port: 53332,
    }
    
})