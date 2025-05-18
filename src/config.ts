export const SITE = {
  website: "https://www.kylehusmann.com/", // replace this with your deployed domain
  author: "Kyle Husmann",
  profile: "https://www.kylehusmann.com/about",
  desc: "Kyle's hub of projects and ideas.",
  title: "Kyle Husmann",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Suggest Changes",
    url: "https://github.com/khusmann/khusmann.github.io/edit/main/",
  },
  dynamicOgImage: true,
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "America/Los_Angeles", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
