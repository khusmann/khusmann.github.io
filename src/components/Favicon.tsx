import { useEffect, useState } from "react";

export default function Favicon() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    return mediaQuery.matches ? "dark" : "light";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = ({ matches }: MediaQueryListEvent) => {
      setTheme(matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <link
      id="favicon"
      rel="icon"
      href={`/favicon-${theme}.svg`}
      type="image/svg+xml"
    />
  );
}
