import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        home: resolve(__dirname, "home.html"),
        bloomflower: resolve(__dirname, "bloomflower.html"),
        playgames: resolve(__dirname, "playgames.html"),
        readmessage: resolve(__dirname, "readmessage.html"),
        viewpic: resolve(__dirname, "viewpic.html"),
      },
    },
  },
});
