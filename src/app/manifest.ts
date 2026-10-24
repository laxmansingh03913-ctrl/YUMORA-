import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yomika — Stories. Comics. Worlds.",
    short_name: "Yomika",
    description:
      "Discover original novels, manga, webtoons, and comics from independent creators around the world.",
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    background_color: "#121214",
    theme_color: "#D91E18",
    categories: ["entertainment", "books"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
