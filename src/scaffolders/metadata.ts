import fs from 'fs-extra';

export async function createConstants() {
  const navConstantsFile = `export const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export const FOOTER_LINKS = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];`;

  fs.writeFileSync('constants/nav.constants.ts', navConstantsFile);

  const indexConstantsFile = `export * from './nav.constants';`;

  fs.writeFileSync('constants/index.ts', indexConstantsFile);
}

export async function createTypes() {
  const userTypesFile = `export interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  emailVerified: boolean;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  governorate?: string;
  telephone?: string;
  postalCode?: string;
  userId: string;
}`;

  fs.writeFileSync('types/users.types.ts', userTypesFile);

  const indexTypesFile = `export * from './users.types';`;

  fs.writeFileSync('types/index.ts', indexTypesFile);
}

export async function createSchemas() {
  const userSchemasFile = `import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  laboratory: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;`;

  fs.writeFileSync('schemas/users.schemas.ts', userSchemasFile);

  const indexSchemasFile = `export * from './users.schemas';`;

  fs.writeFileSync('schemas/index.ts', indexSchemasFile);
}