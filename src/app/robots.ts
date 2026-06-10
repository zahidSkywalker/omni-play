import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/topics", "/leaderboard", "/lookup"],
        disallow: ["/api/", "/admin/", "/profile/", "/certificate/", "/result/", "/groups/"],
      },
    ],
    sitemap: "https://learn-tech-with-zahid.vercel.app/sitemap.xml",
  };
}
