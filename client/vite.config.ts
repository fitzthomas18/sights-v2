import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default {
  root: ".",
  base: "/",
  plugins: [
    react(),
    svgr(),
    tailwindcss(),
    tsconfigPaths(),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
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
          editor: [
            // "@uiw/react-codemirror",
            // "@codemirror/language",
            // "@codemirror/legacy-modes/mode/simple-mode",
            // "@codemirror/theme-one-dark",
          ],
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
