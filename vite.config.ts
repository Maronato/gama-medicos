import path from "path"

import react from "@vitejs/plugin-react"
import { defineConfig, UserConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config: UserConfig = {
    plugins: [react()],
    server: {
      headers: {
        "Accept-Ranges": "bytes",
      },
    },
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    },
  }
  if (command === "build") {
    config.base = "/mck-medicos/"
  }
  return config
})
