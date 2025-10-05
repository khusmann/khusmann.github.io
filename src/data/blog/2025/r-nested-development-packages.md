---
author: Kyle Husmann
pubDatetime: 2025-10-04T18:00:00-07:00
title: "A More Customizable Golem: Nested Development Packages in R"
slug: r-nested-development-packages
featured: true
draft: false
tags:
  - shiny
  - software
  - tips
description: Unify your development scripts and helpers with this little trick.
---

I'm a big fan of packages like [golem](https://github.com/ThinkR-open/golem), [usethis](https://usethis.r-lib.org/), and [devtools](https://devtools.r-lib.org/), that improve developer experience in R by automating everyday tasks.

That said, these general tools only go so far: when I'm developing a production Shiny App or API in R, I often find myself building and maintaining a stack of development scripts and helpers that are specific to the project and particularities of the development and deployment environments I'm working in.

These scripts and helpers can range from launchers for multiple development-mode mocked configurations of the project, to synthetic data generators, to complex deployment / publishing orchestration across multiple systems... the list goes on and on.

Many language ecosystems include first-class mechanisms for defining project-local development tasks (e.g., npm scripts for Node, Makefiles for C/C++), making it easy to automate and share common workflows. In R, by contrast, this layer is usually more ad hoc.

For a while, I followed the golem approach of putting these scripts and helpers in R files in a `/dev` folder in my R project, but I quickly grew out of this for a number of reasons:

1. Sourced `.R` files pollute the global environment. (sure, you can use `local()`, and `source(local = TRUE)` but takes a lot of vigilance to ensure dev scripts "leave no trace").
1. Sharing code between sourced `.R` files requires sourcing their dependencies, which quickly becomes convoluted.
1. There's no really good way to pass arguments to the `.R` scripts.
1. Values technically can be returned from sourced scripts, but it's ugly (`source("foo.R")$value`).

I often find myself wishing I could have my _own_ R package of helpers specific to a project. For example if I'm developing a Shiny application named `myapp`, I'd like a separate `myapp.dev` package where I can keep all my developement scripts and helpers. That way, when I'm developing the app, instead of running:

```r
source("dev/run_dev_config1.R")
```

I can call a function scoped to my development package, like this:

```r
myapp.dev::run("config1")
```

Now I have all of the niceties of an R package available to my development scripts and helpers: I can decide which functions I want to export or keep internally scoped, I can generate [pkgdown](https://pkgdown.r-lib.org/) documentation for my development functions, I can have dependencies specific to my development package, etc. etc.

The big problem with creating a separate package for development scripts, of course, is the extra complexity you incur by having to keep your application package in sync with your development package: Developers of `myapp` need to be notified every time there are updates to `myapp.dev`, and you need to publish and maintain this (very niche) library somewhere. Not ideal.

## The Solution: Nested Development Packages

As you may have guessed from the title of this post, I've stumbled on a neat pattern that solves all the issues I outlined above:

_Nest the dev package inside your application package, and set up your `.Rprofile` to load its namespace whenever you open your project in an interactive session._

Now, your dev package is automatically locked to your application development, because it lives inside your application repo. Whever the dev package is updated, devs only need to pull the latest version of the application repo, then restart their R session to make the fresh dev package available in their environment.

I've created a bare-bones repo to illustrate this technique [(link)](https://github.com/khusmann/r-nested-devpkg-example). I've included two example projects: one with a minimal setup (described below), and a setup that uses renv (described in the next section).

Go ahead and clone the repo, then open the first example project (`myapp/myapp.Rproj`) in RStudio (or Positron). When you open the project, in addition to the standard R greeting, you should see:

```
ℹ Loading myapp.dev
```

Which indicates the development package is loaded. Note that pkgload is required to load the package -- if you don't have pkgload installed, you'll get the message:

```
Warning message:
Unable to load myapp.dev, pkgload is not installed.
Please run `install.packages("pkgload")` and then restart your session.
```

If so, simply `install.packages("pkgload")` and restart your session as instructed, and myapp.dev should get loaded when the session starts.

Once your session starts with myapp.dev namespace is loaded into your environment, type `myapp.dev::` and you should get an autocomplete listing the available functions. In this barebones example, we have `myapp.dev::run()` and `myapp.dev::deploy()` which run the myapp Shiny app and pretend to deploy it, respectively.

### Setup Notes

This setup is made possible by the following `.Rprofile`:

```r
if (interactive()) {
  if (requireNamespace("pkgload", quietly = TRUE)) {
    pkgload::load_all(
      "dev",
      attach = FALSE,
      export_all = FALSE,
      attach_testthat = FALSE
    )
  } else {
    warning(
      paste0(
        'Unable to load mypackage.dev, pkgload is not installed.\n',
        'Please run `install.packages("pkgload") and then restart your session.'
      ),
      call. = FALSE
    )
  }
}
```

As you can see, it's pretty straightforward: if pkgload is available, we use it to load the myapp.dev package from `dev/`, otherwise we warn the user.

Also note how `^dev$` is added to `.Rbuildignore` so the myapp.dev package does not get bundled with the myapp package when it is installed.

## renv Support

With a little bit more setup effort, you can configure renv to create an `renv.lock` file that ensures all developers on a project are using the same versions of packages imported by both `myapp` AND `myapp.dev`.

To see this in action, open the project `myapp-renv/myapp.Rproj` from the [example repo](https://github.com/khusmann/r-nested-devpkg-example) in Rstudio (or Positron).

When you open it the first time, you should see:

```
- Project '~/Projects/r-nested-devpkg-example/myapp-renv' loaded. [renv 1.1.4]
- One or more packages recorded in the lockfile are not installed.
- Use `renv::status()` for more details.
Warning message:
Your development environment is not set up.
Please resolve `renv::status()` and then restart your session.
```

Resolve the warning by running `renv::restore()` and restarting your session. You should now be greeted with:

```
- Project '~/Projects/r-nested-devpkg-example/myapp-renv' loaded. [renv 1.1.4]
ℹ Loading myapp.dev
```

And now the package versions in your development environment are all controlled via renv!

### Setup Notes

Let's dive into the new `.Rprofile`:

```r
# Have renv explicitly use all the deps in DESCRIPTION and dev/DESCRIPTION
# Note: for this hook to be used, you must use
# `renv$settings$snapshot.type("custom")` when setting up your renv
# for the project
options(
  renv.snapshot.filter = function(project) {
    renv::dependencies(
      file.path(project, c("DESCRIPTION", "dev/DESCRIPTION")),
      dev = TRUE,
      quiet = TRUE
    )$Package
  }
)

source("renv/activate.R")

if (interactive()) {
  source("dev/activate.R")
}
```

As you can see, we provide a custom `renv.snapshot.filter` hook to grab dependencies from the `DESCRIPTION`s of both `myapp` and `myapp.dev`. As the comment notes, in order for renv to use this custom hook, you must set `renv$settings$snapshot.type("custom")` when setting up your renv.

Here's the contents of `dev/activate.R`:

```r
local({
  make_quiet <- function(code) {
    sink(nullfile())
    on.exit(sink(), add = TRUE)
    force(code)
  }

  # Use make_quiet to prevent renv from printing
  renv_status <- make_quiet(renv::status())

  if (renv_status$synchronized) {
    pkgload::load_all(
      "dev",
      attach = FALSE,
      export_all = FALSE,
      attach_testthat = FALSE
    )
  } else {
    warning(
      paste0(
        "Your development environment is not set up.\n",
        "Please resolve `renv::status()` and then restart your session."
      ),
      call. = FALSE
    )
  }
})
```

This part is straightforward as well: we only load the dev package if renv is in the "synchronized" state -- otherwise we warn the user.

### Deployment Notes

When you deploy your myapp package, you probably don't want to include the development package, nor its dependencies. I handle this in my deployment scripts by doing the following:

1. I use clone a fresh copy of the repo into a temporary folder (using `git clone --depth 1`).
1. In the cloned directory, I create a fresh lockfile without the myapp.dev dependencies by running:

   ```
   renv::snapshot(
     ".",
     packages = renv::dependencies("DESCRIPTION")$Package,
     prompt = FALSE
   )
   ```

1. I then deploy the app via `rsconnect::deployApp()` and use the `appFiles =` argument to control which files I deploy.

I've included a sketch of this approach in [`myapp-renv/dev/R/deploy.R`](https://github.com/khusmann/r-nested-devpkg-example/blob/main/myapp-renv/dev/R/deploy.R).

Side note: A nice side-effect of cloning the repo to a temporary folder before deploying is that it ensures that your deployment matches what's in git (no local changes, data, or secrets can creep in).

## Final Notes

So far, I've found that the biggest downside / friction in this approach is managing your environment while you are making updates to the dev package. When you make changes, it's easy to forget to restart your session (or manually `devtools::load_all("dev")`) to have the changes go into effect. Similarly, when changing exports you need to run `devtools::document("dev")` to update the `NAMESPACE` of your dev package.

In addition, it's a bit of a pain to set up a dev package from scratch in a new repo (especially if you're using renv!). That all said, if this approach catches on and there's enough interest, I could be convinced to create a universal helper package (like usethis) focused on automating these little meta-tasks and setup associated with dev packages. If you try the dev package pattern, please let me know how it goes!
