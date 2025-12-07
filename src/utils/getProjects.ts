import { readFileSync } from "fs";
import { load } from "js-yaml";

export interface Project {
  // Required fields
  id: string;
  name: string;
  description: string;

  // Optional link fields
  url?: string;
  github?: string;
  paper?: string;
  package?: string; // Format: "npm:package-name" | "pypi:package-name" | "cran:package-name"

  // Optional tech & categorization
  tech?: string[];

  // Optional display settings
  logoShadow?: boolean; // defaults to true - whether to apply drop shadow in light mode

  // Optional metadata
  created?: string; // YYYY-MM-DD
  lastUpdated?: string; // YYYY-MM-DD
  featured?: boolean;
}

export type ProjectRegistry = "npm" | "pypi" | "cran";

export interface ParsedPackage {
  registry: ProjectRegistry;
  name: string;
  url: string;
  displayName: string;
}

/**
 * Parse package string (e.g., "npm:benlink") into registry, name, and URL
 */
export function parsePackage(packageStr: string): ParsedPackage | null {
  if (!packageStr) return null;

  const [registry, name] = packageStr.split(":");
  if (!registry || !name) return null;

  const registryUrls: Record<ProjectRegistry, (name: string) => string> = {
    npm: name => `https://www.npmjs.com/package/${name}`,
    pypi: name => `https://pypi.org/project/${name}/`,
    cran: name => `https://cran.r-project.org/package=${name}`,
  };

  const displayNames: Record<ProjectRegistry, string> = {
    npm: "npm",
    pypi: "PyPI",
    cran: "CRAN",
  };

  if (!(registry in registryUrls)) return null;

  return {
    registry: registry as ProjectRegistry,
    name,
    url: registryUrls[registry as ProjectRegistry](name),
    displayName: displayNames[registry as ProjectRegistry],
  };
}

export type PaperType = "post" | "doi" | "pub";

export interface ParsedPaper {
  type: PaperType;
  label: string;
  url: string;
}

/**
 * Parse paper string (e.g., "post:2025/post", "doi:10.1016/j.jsp.2022.04.004", or "pub:https://example.com") into type, label, and URL
 */
export function parsePaper(paperStr: string): ParsedPaper | null {
  if (!paperStr) return null;

  const colonIndex = paperStr.indexOf(":");
  if (colonIndex === -1) return null;

  const type = paperStr.substring(0, colonIndex);
  const value = paperStr.substring(colonIndex + 1);

  if (!type || !value) return null;

  if (type === "post") {
    return {
      type: "post",
      label: "Blog Post",
      url: `/posts/${value}`,
    };
  }

  if (type === "doi") {
    return {
      type: "doi",
      label: "Publication",
      url: `https://doi.org/${value}`,
    };
  }

  if (type === "pub") {
    return {
      type: "pub",
      label: "Publication",
      url: value,
    };
  }

  return null;
}

// Load and parse projects once at module level
const projectsYaml = readFileSync("src/data/projects.yaml", "utf8");
const projects = load(projectsYaml) as Project[];

export function getProjects(): Project[] {
  return projects;
}
