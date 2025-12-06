export interface Project {
  // Required fields
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "maintenance";

  // Optional link fields
  url?: string;
  github?: string;
  paper?: string;
  package?: string; // Format: "npm:package-name" | "pypi:package-name" | "cran:package-name"

  // Optional tech & categorization
  tech?: string[];
  tags?: string[];

  // Optional asset fields (relative to src/assets/projects/{id}/)
  logo?: string; // defaults to "logo.svg"
  screenshot?: string; // defaults to "screenshot.png"

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
}

/**
 * Parse package string (e.g., "npm:benlink") into registry, name, and URL
 */
export function parsePackage(packageStr: string): ParsedPackage | null {
  if (!packageStr) return null;

  const [registry, name] = packageStr.split(":");
  if (!registry || !name) return null;

  const registryUrls: Record<ProjectRegistry, (name: string) => string> = {
    npm: (name) => `https://www.npmjs.com/package/${name}`,
    pypi: (name) => `https://pypi.org/project/${name}/`,
    cran: (name) => `https://cran.r-project.org/package=${name}`,
  };

  if (!(registry in registryUrls)) return null;

  return {
    registry: registry as ProjectRegistry,
    name,
    url: registryUrls[registry as ProjectRegistry](name),
  };
}
