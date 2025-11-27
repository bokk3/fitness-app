import { betterAuth } from "better-auth";
import { getDb } from "./db";

const db = getDb();

export const auth = betterAuth({
    database: db,
    emailAndPassword: {  
        enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET || "development_secret_key_1234567890",
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }
    },
});
