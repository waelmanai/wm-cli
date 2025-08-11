import fs from 'fs-extra';

export async function createActionsExample() {
  // Create users folder structure
  fs.ensureDirSync('actions/getUsers');

  // Schema
  const getUsersSchemaFile = `import { z } from "zod";

const addressSchema = z.object({
    governorate: z.string().nullable().optional(),
    telephone: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
}).nullable().optional();

export const userSchema = z.object({
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    email: z.string(),
    laboratory: z.string().nullable().optional(),
    name: z.string(),
    id: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable().optional(),
    profileCompleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    address: z.array(addressSchema),
});

export const getAllUsersSchema = z.array(userSchema);

export { userSchema as singleUserSchema };`;

  fs.writeFileSync('actions/getUsers/schemas.ts', getUsersSchemaFile);

  // Types
  const getUsersTypesFile = `import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { getAllUsersSchema } from "./schemas";

export type InputType = z.infer<typeof getAllUsersSchema>;
export type ReturnType = ActionState<InputType, InputType>;`;

  fs.writeFileSync('actions/getUsers/types.ts', getUsersTypesFile);

  // Action
  const getUsersActionFile = `"use server";

import { createSafeAction } from "@/lib/create-safe-action";
import { ReturnType } from "./types";
import { prisma } from "@/lib/db";
import { getAllUsersSchema } from "./schemas";
import { z } from "zod";

const handler = async (): Promise<ReturnType> => {
    try {

        const users = await prisma.user.findMany({
            where: {
                role: 'user',
            },
            orderBy: { createdAt: 'desc' },
            include: {
                address: {
                    select: {
                        governorate: true,
                        telephone: true,
                        postalCode: true
                    }
                }
            }
        });
        
        if (!users) {
            return {
                error: "No users found"
            };
        }
        
        const validatedUsers = getAllUsersSchema.parse(users);
        
        const result = {
            data: validatedUsers
        };
        
        return result;

    } catch (error) {
        console.error("❌ Error in handler:", error);
        return {
            error: "Error fetching users"
        };
    }
};

export const GetAllUsers = createSafeAction(z.object({}), handler);`;

  fs.writeFileSync('actions/getUsers/index.ts', getUsersActionFile);
}