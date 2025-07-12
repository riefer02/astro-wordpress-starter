// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://your-site.com",
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.WP_API_URL": JSON.stringify(
        process.env.WP_API_URL || "https://your-wordpress-site.com/wp-json"
      ),
    },
  },

  output: "static",
});
