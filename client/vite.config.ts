import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default {
  root: ".",
  base: "/",
  plugins: [react(), svgr(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["chart.js", "react-chartjs-2"],
          icons: ["react-icons"],
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: [
            "@headlessui/react",
            "react-hot-toast",
            "react-circular-progressbar",
          ],
        },
      },
    },

    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
};
