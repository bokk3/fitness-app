import { betterAuth } from "better-auth";
import { getDb } from "./db";

const db = getDb();

export const auth = betterAuth({
    database: db,
    // debug: true,
    user: {
        fields: {
            emailVerified: "email_verified",
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    },
    session: {
        fields: {
            expiresAt: "expires_at",
            createdAt: "created_at",
            updatedAt: "updated_at",
            ipAddress: "ip_address",
            userAgent: "user_agent",
            userId: "user_id"
        }
    },
    account: {
        fields: {
            accountId: "account_id",
            providerId: "provider_id",
            userId: "user_id",
            accessToken: "access_token",
            refreshToken: "refresh_token",
            idToken: "id_token",
            expiresAt: "expires_at",
            password: "password",
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    },
    verification: {
        fields: {
            expiresAt: "expires_at",
            createdAt: "created_at",
            updatedAt: "updated_at",
            value: "value",
            identifier: "identifier"
        }
    },
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
