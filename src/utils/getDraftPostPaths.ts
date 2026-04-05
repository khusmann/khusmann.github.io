import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import kebabcase from "lodash.kebabcase";

const BLOG_PATH = "src/data/blog";

function walkBlogDir(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkBlogDir(full));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function readFrontmatter(filePath: string): Record<string, unknown> {
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  return (yaml.load(match[1]) as Record<string, unknown>) ?? {};
}

// Mirrors the URL logic in src/utils/getPath.ts: directory segments are
// slugified, the filename basename is used as-is for the slug.
function filePathToPostPath(filePath: string): string {
  const rel = path.relative(BLOG_PATH, filePath).replace(/\\/g, "/");
  const parts = rel.split("/").filter(p => !p.startsWith("_"));
  const file = parts.pop()!;
  const slug = file.replace(/\.(md|mdx)$/, "");
  const segments = parts.map(p => kebabcase(p));
  return "/posts/" + [...segments, slug].join("/");
}

/**
 * Returns pathnames (e.g. "/posts/2026/shinys-achilles-heel") of posts
 * with `draft: true` in their frontmatter. Scans the filesystem directly
 * so it can run from astro.config.ts, where astro:content is unavailable.
 */
export function getDraftPostPaths(): string[] {
  const files = walkBlogDir(BLOG_PATH);
  return files
    .filter(f => readFrontmatter(f).draft === true)
    .map(filePathToPostPath);
}
