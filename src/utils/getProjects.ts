import { readFileSync } from "fs";
import { load } from "js-yaml";
import type { Project } from "@/types/project";

// Load and parse projects once at module level
const projectsYaml = readFileSync("src/data/projects.yaml", "utf8");
const projects = load(projectsYaml) as Project[];

export function getProjects(): Project[] {
  return projects;
}
