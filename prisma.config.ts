import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: (() => {
      const DATABASE_URL = process.env.DATABASE_URL;
      if (!DATABASE_URL) throw new Error("Missing DATABASE_URL env var");
      return DATABASE_URL;
    })(),
  },
});
