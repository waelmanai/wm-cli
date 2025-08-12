import fs from 'fs-extra';
import { ProjectConfig } from '../types';

export async function createActions(config: ProjectConfig) {
  // Always create the example user actions
  await createActionsExample();
  
  // Create contact actions if selected
  if (config.serverActions.contacts) {
    await createContactActions();
  }
}

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

export async function createContactActions() {
  // Create contacts folder structure
  fs.ensureDirSync('actions/contacts/submitContact');
  fs.ensureDirSync('actions/contacts/getAllContacts');
  fs.ensureDirSync('actions/contacts/getContactById');
  fs.ensureDirSync('actions/contacts/deleteContactById');

  // SubmitContact Action
  const submitContactSchemaFile = `import { z } from "zod";

export const ContactEmailSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    companyName: z.string().optional(),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required"),
});`;

  fs.writeFileSync('actions/contacts/submitContact/schema.ts', submitContactSchemaFile);

  const submitContactTypesFile = `import { ActionState } from "@/lib/create-safe-action";
import { Contact } from "@prisma/client";
import { z } from "zod";
import { ContactEmailSchema } from "./schema";

export type SubmitContactInputType = z.infer<typeof ContactEmailSchema>;
export type SubmitContactReturnType = ActionState<SubmitContactInputType, Contact>;`;

  fs.writeFileSync('actions/contacts/submitContact/types.ts', submitContactTypesFile);

  const submitContactIndexFile = `'use server';

import { createSafeAction } from "@/lib/create-safe-action";
import { prisma } from "@/lib/db";
import { ContactEmailSchema } from "./schema";
import {
  SubmitContactInputType,
  SubmitContactReturnType,
} from "./types";


const submitContactHandler = async (data: SubmitContactInputType): Promise<SubmitContactReturnType> => {
  const { firstName, lastName, email, companyName, subject, message } = data;

  try {
    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        companyName: companyName ?? "",
        subject,
        message,
      },
    });

    return {
      data: contact,
    };
  } catch (error) {
    console.error('Error storing contact:', error);
    return {
      error: 'Failed to submit contact form',
    };
  }
};

export const submitContact = createSafeAction(ContactEmailSchema, submitContactHandler);`;

  fs.writeFileSync('actions/contacts/submitContact/index.ts', submitContactIndexFile);

  // GetAllContacts Action
  const getAllContactsSchemaFile = `import { z } from "zod";

export const GetAllContactsSchema = z.object({});`;

  fs.writeFileSync('actions/contacts/getAllContacts/schema.ts', getAllContactsSchemaFile);

  const getAllContactsTypesFile = `import { ActionState } from "@/lib/create-safe-action";
import { Contact } from "@prisma/client";

export type GetAllContactsReturnType = ActionState<object, Contact[]>;`;

  fs.writeFileSync('actions/contacts/getAllContacts/types.ts', getAllContactsTypesFile);

  const getAllContactsIndexFile = `'use server';

import { createSafeAction } from "@/lib/create-safe-action";
import { prisma } from "@/lib/db";
import {
  GetAllContactsSchema
} from "./schema";
import {
  GetAllContactsReturnType,
} from "./types";

const getAllContactsHandler = async (): Promise<GetAllContactsReturnType> => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: contacts,
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return {
      error: 'Unable to fetch contacts',
    };
  }
};

export const getAllContacts = createSafeAction(GetAllContactsSchema, getAllContactsHandler);`;

  fs.writeFileSync('actions/contacts/getAllContacts/index.ts', getAllContactsIndexFile);

  // GetContactById Action
  const getContactByIdSchemaFile = `import { z } from "zod";

export const GetContactByIdSchema = z.object({
  id: z.string()
});`;

  fs.writeFileSync('actions/contacts/getContactById/schema.ts', getContactByIdSchemaFile);

  const getContactByIdTypesFile = `import { ActionState } from "@/lib/create-safe-action";
import { Contact } from "@prisma/client";
import { z } from "zod";
import { GetContactByIdSchema } from "./schema";

export type GetContactByIdInputType = z.infer<typeof GetContactByIdSchema>;
export type GetContactByIdReturnType = ActionState<GetContactByIdInputType, Contact>;`;

  fs.writeFileSync('actions/contacts/getContactById/types.ts', getContactByIdTypesFile);

  const getContactByIdIndexFile = `'use server';

import { createSafeAction } from "@/lib/create-safe-action";
import { prisma } from "@/lib/db";
import { GetContactByIdSchema } from "./schema";
import {
  GetContactByIdInputType,
  GetContactByIdReturnType
} from "./types";

const getContactByIdHandler = async (data: GetContactByIdInputType): Promise<GetContactByIdReturnType> => {
  const { id } = data;

  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      return {
        error: 'Contact not found',
      };
    }

    return {
      data: contact,
    };
  } catch (error) {
    console.error('Error fetching contact by ID:', error);
    return {
      error: 'Unable to fetch contact',
    };
  }
};

export const getContactById = createSafeAction(GetContactByIdSchema, getContactByIdHandler);`;

  fs.writeFileSync('actions/contacts/getContactById/index.ts', getContactByIdIndexFile);

  // DeleteContactById Action
  const deleteContactByIdSchemaFile = `import { z } from "zod";

export const DeleteContactByIdSchema = z.object({
  id: z.string()
});`;

  fs.writeFileSync('actions/contacts/deleteContactById/schema.ts', deleteContactByIdSchemaFile);

  const deleteContactByIdTypesFile = `import { ActionState } from "@/lib/create-safe-action";
import { Contact } from "@prisma/client";
import { z } from "zod";
import { DeleteContactByIdSchema } from "./schema";

export type DeleteContactByIdInputType = z.infer<typeof DeleteContactByIdSchema>;
export type DeleteContactByIdReturnType = ActionState<DeleteContactByIdInputType, Contact>;`;

  fs.writeFileSync('actions/contacts/deleteContactById/types.ts', deleteContactByIdTypesFile);

  const deleteContactByIdIndexFile = `'use server';

import { createSafeAction } from "@/lib/create-safe-action";
import { prisma } from "@/lib/db";
import { DeleteContactByIdSchema } from "./schema";
import {
  DeleteContactByIdInputType,
  DeleteContactByIdReturnType
} from "./types";

const deleteContactByIdHandler = async (data: DeleteContactByIdInputType): Promise<DeleteContactByIdReturnType> => {
  const { id } = data;

  try {
    const contact = await prisma.contact.delete({
      where: { id },
    });

    return {
      data: contact,
    };
  } catch (error) {
    console.error('Error deleting contact by ID:', error);
    return {
      error: 'Unable to delete contact',
    };
  }
};

export const deleteContactById = createSafeAction(DeleteContactByIdSchema, deleteContactByIdHandler);`;

  fs.writeFileSync('actions/contacts/deleteContactById/index.ts', deleteContactByIdIndexFile);
}