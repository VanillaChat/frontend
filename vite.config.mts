import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import {fileURLToPath} from "url";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
        react(),
        viteTsconfigPaths(),
        svgrPlugin(),
        tailwindcss()
    ],
    resolve: {
      alias: {
        // @ts-ignore
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
      server: {
        watch: {
            ignored: ['**/.idea/**']
        },
          allowedHosts: ['localhost', '3813-2a02-a318-e0aa-b480-fb9-2a80-2ec9-51.ngrok-free.app']
      }
  };
});
