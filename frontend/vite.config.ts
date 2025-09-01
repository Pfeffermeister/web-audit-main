import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true, // Erlaubt Zugriff von anderen Geräten
    },
    build: {
        sourcemap: true, // Für besseres Debugging
    },
});