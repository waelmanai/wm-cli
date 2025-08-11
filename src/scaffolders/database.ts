import fs from 'fs-extra';

export async function createPrismaFiles() {
  // Prisma schema
  const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String    @id @default(cuid())
  name             String
  email            String    @unique
  emailVerified    Boolean   @default(false)
  image            String?
  firstName        String?
  lastName         String?
  laboratory       String?
  profileCompleted Boolean   @default(false)
  role             String    @default("user")
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  accounts Account[]
  sessions Session[]
  address  Address[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Address {
  id           String  @id @default(cuid())
  governorate  String?
  telephone    String?
  postalCode   String?
  userId       String
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}`;

  fs.writeFileSync('prisma/schema.prisma', prismaSchema);

  // Seed file
  const seedFile = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Add your seed data here
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
      role: 'admin',
      profileCompleted: true,
    },
  });

  console.log(\`✅ Created user: \${user.email}\`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });`;

  fs.writeFileSync('prisma/seed.ts', seedFile);
}