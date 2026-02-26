import type { MetadataRoute } from "next";

const BASE_URL = process.env.AUTH_URL || "https://localhost:3000";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/dashboard/"],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
