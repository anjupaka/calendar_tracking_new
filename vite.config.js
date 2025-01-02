import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    base: "/calendar_tracking_new/",
        server: {
        port: 53332,
    }
    
})