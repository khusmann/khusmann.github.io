# kylehusmann.com

Welcome to my hub of projects and ideas! I often find myself with things I want to share but no place to put them - hopefully, this site will become that place.

I am currently the process of rebuilding this website to be a more general repository of my interests and projects... please stay tuned!

## 💻 Tech Stack

**Template**: [AstroPaper](https://github.com/satnaing/astro-paper)
**Main Framework** - [Astro](https://astro.build/)  
**Type Checking** - [TypeScript](https://www.typescriptlang.org/)  
**Styling** - [TailwindCSS](https://tailwindcss.com/)  
**UI/UX** - [Figma Design File](https://www.figma.com/community/file/1356898632249991861)  
**Static Search** - [FuseJS](https://pagefind.app/)  
**Icons** - [Tablers](https://tabler-icons.io/)  
**Code Formatting** - [Prettier](https://prettier.io/)  
**Deployment** - [Cloudflare Pages](https://pages.cloudflare.com/)  
**Illustration in About Page** - [https://freesvgillustration.com](https://freesvgillustration.com/)  
**Linting** - [ESLint](https://eslint.org)

## 👨🏻‍💻 Running Locally

Clone the repo, then start the project by running the following commands:

```bash
# install dependencies if you haven't done so in the previous step.
pnpm install

# start running the project
pnpm run dev
```

As an alternative approach, if you have Docker installed, you can use Docker to run this project locally. Here's how:

```bash
# Build the Docker image
docker build -t astropaper .

# Run the Docker container
docker run -p 4321:80 astropaper
```

## Google Site Verification (optional)

You can easily add your [Google Site Verification HTML tag](https://support.google.com/webmasters/answer/9008080#meta_tag_verification&zippy=%2Chtml-tag) in AstroPaper using an environment variable. This step is optional. If you don't add the following environment variable, the google-site-verification tag won't appear in the HTML `<head>` section.

```bash
# in your environment variable file (.env)
PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-site-verification-value
```

> See [this discussion](https://github.com/satnaing/astro-paper/discussions/334#discussioncomment-10139247) for adding AstroPaper to the Google Search Console.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

> **_Note!_** For `Docker` commands we must have it [installed](https://docs.docker.com/engine/install/) in your machine.

| Command                               | Action                                                                                                                           |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                        | Installs dependencies                                                                                                            |
| `pnpm run dev`                        | Starts local dev server at `localhost:4321`                                                                                      |
| `pnpm run build`                      | Build your production site to `./dist/`                                                                                          |
| `pnpm run preview`                    | Preview your build locally, before deploying                                                                                     |
| `pnpm run format:check`               | Check code format with Prettier                                                                                                  |
| `pnpm run format`                     | Format codes with Prettier                                                                                                       |
| `pnpm run sync`                       | Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync). |
| `pnpm run lint`                       | Lint with ESLint                                                                                                                 |
| `docker compose up -d`                | Run AstroPaper on docker, You can access with the same hostname and port informed on `dev` command.                              |
| `docker compose run app pnpm install` | You can run any command above into the docker container.                                                                         |
| `docker build -t astropaper .`        | Build Docker image for AstroPaper.                                                                                               |
| `docker run -p 4321:80 astropaper`    | Run AstroPaper on Docker. The website will be accessible at `http://localhost:4321`.                                             |

> **_Warning!_** Windows PowerShell users may need to install the [concurrently package](https://www.npmjs.com/package/concurrently) if they want to [run diagnostics](https://docs.astro.build/en/reference/cli-reference/#astro-check) during development (`astro check --watch & astro dev`). For more info, see [this issue](https://github.com/satnaing/astro-paper/issues/113).
