import { defineConfig, type PreviewServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { existsSync, readFileSync } from "node:fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "seo-preview-routing",
      configurePreviewServer(server: PreviewServer) {
        const output = path.resolve(
          server.config.root,
          server.config.build.outDir,
        );
        server.middlewares.use((request, response, next) => {
          let pathname: string;
          try {
            pathname = decodeURIComponent(
              new URL(request.url || "/", "http://localhost").pathname,
            );
          } catch {
            response.statusCode = 400;
            response.end("Bad request");
            return;
          }
          const redirectsFile = path.join(output, "blog-redirects.json");
          if (pathname.startsWith("/blog/") && existsSync(redirectsFile)) {
            const redirects = JSON.parse(
              readFileSync(redirectsFile, "utf8"),
            ) as Array<{ old_slug: string; new_slug: string }>;
            const redirect = redirects.find(
              (item) => pathname === `/blog/${item.old_slug}`,
            );
            if (redirect) {
              response.statusCode = 301;
              response.setHeader("Location", `/blog/${redirect.new_slug}`);
              response.end();
              return;
            }
          }
          if (pathname === "/px-manage" || pathname.startsWith("/px-manage/")) {
            request.url = "/admin.html";
            response.setHeader("X-Robots-Tag", "noindex, follow");
            next();
            return;
          }
          const target = path.resolve(output, `.${pathname}`);
          if (target !== output && !target.startsWith(output + path.sep)) {
            response.statusCode = 400;
            response.end("Bad request");
            return;
          }
          if (
            pathname === "/" ||
            existsSync(target) ||
            existsSync(`${target}.html`)
          ) {
            next();
            return;
          }
          response.statusCode = 404;
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.setHeader("X-Robots-Tag", "noindex, follow");
          response.end(readFileSync(path.join(output, "404.html")));
        });
      },
    },
  ].filter(Boolean),
  build: { manifest: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
