import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import { SITE } from "./src/config";
import { getDraftPostPaths } from "./src/utils/getDraftPostPaths";
import mdx from "@astrojs/mdx";

import react from "@astrojs/react";

const draftPostPaths = new Set(getDraftPostPaths());

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    sitemap({
      filter: page => {
        if (!SITE.showArchives && page.endsWith("/archives")) return false;
        try {
          const pathname = new URL(page).pathname.replace(/\/$/, "");
          if (draftPostPaths.has(pathname)) return false;
        } catch {
          // not a URL, fall through
        }
        return true;
      },
    }),
    mdx(),
    react(),
  ],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  server: {
    allowedHosts: [
      // ngrok hosts go here
    ],
  },
  image: {
    // Used for all Markdown images; not configurable per-image
    // Used for all `<Image />` and `<Picture />` components unless overridden with a prop
    experimentalLayout: "responsive",
  },
  experimental: {
    svg: true,
    responsiveImages: true,
    preserveScriptOrder: true,
  },
});
