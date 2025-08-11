import fs from 'fs-extra';
import { ProjectConfig } from '../types';

export async function createLibFiles(features: ProjectConfig['features']) {
  // Utils
  const utilsFile = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

  fs.writeFileSync('lib/utils.ts', utilsFile);

  // Create safe action
  const createSafeActionFile = `import { z } from "zod";

export type FieldErrors<T> = {
    [K in keyof T]?: string[];
};

export type ActionState<TInput, TOutput> = {
    fieldErrors?: FieldErrors<TInput>;
    error?: string | null;
    data?: TOutput;
};

export const createSafeAction = <TInput, TOutput>(
    schema: z.Schema<TInput>,
    handler: (validatedData: TInput) => Promise<ActionState<TInput, TOutput>>
) => {
    return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
        const validationResult = schema.safeParse(data);

        if (!validationResult.success) {
            return {
                fieldErrors: validationResult.error.flatten().fieldErrors as FieldErrors<TInput>,
            }
        }

        return handler(validationResult.data);
    }
}`;

  fs.writeFileSync('lib/create-safe-action.ts', createSafeActionFile);

  // Database config
  const dbFile = `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;`;

  fs.writeFileSync('lib/db.ts', dbFile);

  // Email config (only if nodemailer is selected)
  if (features.nodemailer) {
    const emailConfigFile = `import nodemailer from 'nodemailer';

export const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
};

export const transporter = nodemailer.createTransporter(emailConfig);

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await transporter.sendMail({
            from: \`"\${process.env.SMTP_FROM_NAME}" <\${process.env.SMTP_FROM_EMAIL}>\`,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
};`;

    fs.writeFileSync('lib/email.ts', emailConfigFile);
  }

  // Better Auth config
  const authFile = `import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});`;

  fs.writeFileSync('lib/auth.ts', authFile);

  // Auth client
  const authClientFile = `import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
});`;

  fs.writeFileSync('lib/auth-client.ts', authClientFile);
}