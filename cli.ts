#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';

interface ProjectConfig {
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  reactVersion: '18' | '19';
  initInCurrentDir: boolean;
  features: {
    database: boolean;
    docker: boolean;
    husky: boolean;
    linting: boolean;
    nodemailer: boolean;
    betterAuth: boolean;
  };
  components: {
    dataTable: boolean;
    customInputs: boolean;
    fileUpload: boolean;
    dateTimeInput: boolean;
    radioGroupInput: boolean;
  };
}

async function createProject() {
  console.log(chalk.blue.bold('🚀 Custom Full-Stack Next.js Generator'));
  console.log(chalk.gray('Creating a production-ready Next.js app with your custom stack\n'));

  // Get CLI arguments
  const args = process.argv.slice(2);
  const targetDir = args[0];

  // Check if we should init in current directory
  const currentDirName = path.basename(process.cwd());
  const isCurrentDirEmpty = fs.readdirSync(process.cwd()).length === 0;

  const response = await prompts([
    {
      type: () => targetDir ? null : 'text',
      name: 'projectName',
      message: `Project name? ${isCurrentDirEmpty ? `(or press Enter to use current directory: ${currentDirName})` : ''}`,
      initial: isCurrentDirEmpty ? currentDirName : 'my-nextjs-app',
      validate: (value) => {
        if (!value && !isCurrentDirEmpty) {
          return 'Project name is required when current directory is not empty';
        }
        if (value === '.' || value === './') {
          return true;
        }
        return value.length > 0 ? true : 'Project name is required';
      }
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: [
        { title: 'pnpm (recommended)', value: 'pnpm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'npm', value: 'npm' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'reactVersion',
      message: 'Which React version would you like to use?',
      choices: [
        { title: 'React 18 (Stable LTS - Recommended)', value: '18' },
        { title: 'React 19 (Latest - Experimental features)', value: '19' }
      ],
      initial: 0
    },
    {
      type: 'multiselect',
      name: 'features',
      message: 'Select features to include:',
      choices: [
        { title: 'Database (Prisma)', value: 'database', selected: true },
        { title: 'Authentication (Better Auth)', value: 'betterAuth', selected: true },
        { title: 'Docker Configuration', value: 'docker', selected: true },
        { title: 'Git Hooks (Husky)', value: 'husky', selected: true },
        { title: 'Linting & Formatting', value: 'linting', selected: true },
        { title: 'Email (Nodemailer)', value: 'nodemailer', selected: false }
      ]
    },
    {
      type: 'multiselect',
      name: 'components',
      message: 'Select components to include:',
      choices: [
        { title: 'Data Table (Advanced table with filtering/sorting)', value: 'dataTable', selected: true },
        { title: 'Custom Input Components', value: 'customInputs', selected: true },
        { title: 'File Upload Component', value: 'fileUpload', selected: false },
        { title: 'Date Time Input', value: 'dateTimeInput', selected: false },
        { title: 'Radio Group Input', value: 'radioGroupInput', selected: false }
      ]
    }
  ]);

  if (response.projectName === false) {
    console.log(chalk.red('❌ Project creation cancelled'));
    process.exit(1);
  }

  // Determine project configuration
  const projectName = targetDir || response.projectName || currentDirName;
  const initInCurrentDir = !targetDir && (!response.projectName || response.projectName === '.' || response.projectName === './' || (isCurrentDirEmpty && response.projectName === currentDirName));

  const config: ProjectConfig = {
    projectName: initInCurrentDir ? currentDirName : projectName,
    packageManager: response.packageManager,
    reactVersion: response.reactVersion,
    initInCurrentDir,
    features: {
      database: response.features.includes('database'),
      docker: response.features.includes('docker'),
      husky: response.features.includes('husky'),
      linting: response.features.includes('linting'),
      nodemailer: response.features.includes('nodemailer'),
      betterAuth: response.features.includes('betterAuth')
    },
    components: {
      dataTable: response.components.includes('dataTable'),
      customInputs: response.components.includes('customInputs'),
      fileUpload: response.components.includes('fileUpload'),
      dateTimeInput: response.components.includes('dateTimeInput'),
      radioGroupInput: response.components.includes('radioGroupInput')
    }
  };

  await scaffoldProject(config);
}

async function scaffoldProject(config: ProjectConfig) {
  const { projectName, packageManager, reactVersion, initInCurrentDir, features, components } = config;

  if (initInCurrentDir) {
    console.log(chalk.yellow(`📁 Initializing project in current directory: ${process.cwd()}`));

    // Check if current directory has conflicting files
    const conflictingFiles = ['package.json', 'next.config.js', 'tsconfig.json'];
    const conflicts = conflictingFiles.filter(file => fs.existsSync(file));

    if (conflicts.length > 0) {
      console.log(chalk.red(`❌ Current directory contains conflicting files: ${conflicts.join(', ')}`));
      console.log(chalk.yellow('Please run the command in an empty directory or specify a new project name.'));
      process.exit(1);
    }
  } else {
    console.log(chalk.yellow(`📁 Creating project: ${projectName}`));

    // Check if directory already exists
    if (fs.existsSync(projectName)) {
      console.log(chalk.red(`❌ Directory ${projectName} already exists`));
      console.log(chalk.yellow('Please choose a different project name or remove the existing directory.'));
      process.exit(1);
    }

    // Create project directory
    fs.ensureDirSync(projectName);
    process.chdir(projectName);
  }

  // Create package.json
  await createPackageJson(projectName, packageManager, features);

  // Create folder structure
  await createFolderStructure(features, components);

  // Create configuration files
  await createConfigFiles();

  // Create core files
  await createCoreFiles(features);

  // Create components based on selection
  if (components.customInputs) {
    await createCustomComponents();
  }
  
  // Create shared components
  await createSharedComponents(components);

  // Create lib files
  await createLibFiles(features);



  // Create actions example
  await createActionsExample();

  // Create stores
  await createStores();

  // Create hooks
  await createHooks();

  // Create app files
  await createAppFiles(features);

  // Create constants, types, and schemas
  await createConstants();
  await createTypes();
  await createSchemas();

  if (features.docker) {
    await createDockerFiles();
  }

  if (features.database) {
    await createPrismaFiles();
  }

  // Install dependencies
  console.log(chalk.yellow('📦 Installing dependencies...'));
  try {
    const installCommand = packageManager === 'yarn' ? 'yarn install' :
      packageManager === 'pnpm' ? 'pnpm install' : 'npm install';

    execSync(installCommand, { stdio: 'inherit' });
    console.log(chalk.green('✅ Dependencies installed successfully!'));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to install dependencies. Please run ${packageManager} install manually.`));
  }

  // Setup additional tools based on selection
  if (features.husky) {
    await setupAdditionalTools(packageManager);
  }

  // Install shadcn/ui components after all dependencies are installed
  await installShadcnComponents(packageManager, components);

  console.log(chalk.green.bold(`\n🎉 Project ${projectName} created successfully!\n`));
  console.log(chalk.blue('📋 Next steps:'));

  if (!initInCurrentDir) {
    console.log(chalk.gray(`  cd ${projectName}`));
  }

  console.log(chalk.gray('  cp .env.example .env.local'));
  console.log(chalk.gray('  # Configure your environment variables'));
  if (features.database) {
    console.log(chalk.gray(`  ${packageManager} run setup  # This will setup database and run dev server`));
  } else {
    console.log(chalk.gray(`  ${packageManager} run dev`));
  }

  console.log(chalk.blue('\n🔧 Don\'t forget to:'));
  console.log(chalk.gray('  • Configure your database connection'));
  console.log(chalk.gray('  • Set up your authentication providers'));
  console.log(chalk.gray('  • Configure SMTP settings for email'));
}

async function createPackageJson(projectName: string, packageManager: string, features: ProjectConfig['features']) {
  // Base scripts that are always included
  const scripts: Record<string, string> = {
    dev: 'next dev',
    build: 'next build',
    start: 'next start'
  };

  // Add conditional scripts
  if (features.linting) {
    scripts.lint = 'next lint';
    scripts['lint:fix'] = 'eslint . --fix';
    scripts.format = 'prettier --write .';
    scripts['format:check'] = 'prettier --check .';
    scripts['type-check'] = 'tsc --noEmit';
  }

  if (features.database) {
    const setupScript = packageManager === 'npm'
      ? 'npm install && npx prisma db push --force-reset && npx prisma generate && npx prisma db seed && npm run dev'
      : packageManager === 'yarn'
        ? 'yarn install && yarn prisma db push --force-reset && yarn prisma generate && yarn prisma db seed && yarn dev'
        : 'pnpm install && pnpm prisma db push --force-reset && pnpm prisma generate && pnpm prisma db seed && pnpm dev';
    
    scripts.setup = setupScript;
    scripts['db:push'] = 'prisma db push';
    scripts['db:seed'] = 'prisma db seed';
    scripts['db:generate'] = 'prisma generate';
    scripts['db:studio'] = 'prisma studio';
    scripts['dev:studio'] = 'concurrently --kill-others-on-fail --prefix-colors "cyan.bold,magenta.bold" --names "NEXT,PRISMA" "npm run dev" "npm run db:studio"';
  }

  if (features.husky) {
    scripts.prepare = 'husky';
  }


  // Base dependencies that are always included (with security by default)
  const dependencies: Record<string, string> = {
    next: 'latest',
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    typescript: 'latest',
    '@types/node': 'latest',
    '@types/react': '^18.3.17',
    '@types/react-dom': '^18.3.5',
    tailwindcss: 'latest',
    '@tailwindcss/postcss': 'latest',
    autoprefixer: 'latest',
    postcss: 'latest',
    'class-variance-authority': 'latest',
    clsx: 'latest',
    'tailwind-merge': 'latest',
    'tailwindcss-animate': 'latest',
    'lucide-react': 'latest',
    zustand: 'latest',
    'react-hook-form': 'latest',
    '@hookform/resolvers': 'latest',
    zod: 'latest',
  };

  // Add conditional dependencies
  if (features.betterAuth) {
    dependencies['better-auth'] = 'latest';
  }

  if (features.database) {
    dependencies['@prisma/client'] = 'latest';
  }

  if (features.nodemailer) {
    dependencies.nodemailer = 'latest';
    dependencies['@types/nodemailer'] = 'latest';
  }


  // Base dev dependencies
  const devDependencies: Record<string, string> = {};

  if (features.database) {
    devDependencies.prisma = 'latest';
    devDependencies.tsx = 'latest';
    devDependencies.concurrently = 'latest';
  }

  if (features.linting) {
    devDependencies.eslint = 'latest';
    devDependencies['eslint-config-next'] = 'latest';
    devDependencies['@typescript-eslint/eslint-plugin'] = 'latest';
    devDependencies['@typescript-eslint/parser'] = 'latest';
    devDependencies['eslint-plugin-react'] = 'latest';
    devDependencies['eslint-plugin-react-hooks'] = 'latest';
    devDependencies.prettier = 'latest';
    devDependencies['prettier-plugin-tailwindcss'] = 'latest';
  }

  if (features.husky) {
    devDependencies.husky = 'latest';
    devDependencies['lint-staged'] = 'latest';
  }


  // Build package.json object
  const packageJson: any = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts,
    dependencies,
    devDependencies
  };

  // Add conditional config
  if (features.husky && features.linting) {
    packageJson['lint-staged'] = {
      '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
      '*.{json,css,md}': ['prettier --write']
    };
  }

  if (features.database) {
    packageJson.prisma = {
      seed: 'tsx prisma/seed.ts'
    };
  }

  fs.writeJsonSync('package.json', packageJson, { spaces: 2 });
}

async function createFolderStructure(features: ProjectConfig['features'], components: ProjectConfig['components']) {
  // Base folders that are always needed
  const folders = [
    'actions',
    'app',
    'components/ui',
    'constants',
    'contexts',
    'hooks',
    'lib',
    'lib/security',
    'providers',
    'public/images',
    'public/icons',
    'schemas',
    'stores',
    'types',
    'utils'
  ];

  // Add conditional folders based on component selections
  if (components.customInputs || components.fileUpload || components.dateTimeInput || components.radioGroupInput) {
    folders.push('components/shared/inputs');
  }

  if (components.dataTable) {
    folders.push(
      'components/shared/data-table/components',
      'components/shared/data-table/hooks',
      'components/shared/data-table/utils',
      'components/shared/data-table/types'
    );
  }

  // Add database folder if needed
  if (features.database) {
    folders.push('prisma');
  }

  folders.forEach(folder => {
    fs.ensureDirSync(folder);
  });
}

async function createConfigFiles() {
  // Next.js config
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;`;

  fs.writeFileSync('next.config.js', nextConfig);

  // TypeScript config
  const tsConfig = {
    compilerOptions: {
      lib: ['dom', 'dom.iterable', 'es6'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [
        {
          name: 'next'
        }
      ],
      baseUrl: '.',
      paths: {
        '@/*': ['./*']
      }
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules']
  };

  fs.writeJsonSync('tsconfig.json', tsConfig, { spaces: 2 });

  // Tailwind config
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;

  fs.writeFileSync('tailwind.config.js', tailwindConfig);

  // PostCSS config
  const postcssConfig = `module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}`;

  fs.writeFileSync('postcss.config.js', postcssConfig);

  // Prettier config
  const prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    plugins: ['prettier-plugin-tailwindcss']
  };

  fs.writeJsonSync('.prettierrc', prettierConfig, { spaces: 2 });

  // ESLint config
  const eslintConfig = {
    extends: [
      'next/core-web-vitals',
      '@typescript-eslint/recommended',
      'prettier'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error'
    }
  };

  fs.writeJsonSync('.eslintrc.json', eslintConfig, { spaces: 2 });

  // Environment variables
  const envExample = `DATABASE_URL=PLACEHOLDER

#Base URL of your app ( Development )
BETTER_AUTH_URL=PLACEHOLDER
NEXT_PUBLIC_APP_URL=PLACEHOLDER

BETTER_AUTH_SECRET=PLACEHOLDER
GOOGLE_CLIENT_ID=PLACEHOLDER
GOOGLE_CLIENT_SECRET=PLACEHOLDER

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=PLACEHOLDER
SMTP_PASSWORD=PLACEHOLDER
SMTP_FROM_NAME=PLACEHOLDER
SMTP_FROM_EMAIL=PLACEHOLDER

`;

  fs.writeFileSync('.env.example', envExample);

  // Gitignore
  const gitignore = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`;

  fs.writeFileSync('.gitignore', gitignore);
}

async function createCoreFiles(features: ProjectConfig['features']) {
  // Global CSS
  const globalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
 
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
 
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
 
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
 
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
 
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
 
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
 
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;

  fs.writeFileSync('app/globals.css', globalCss);

  // Middleware - always includes security, optional Arcjet
  const baseSecurityMiddleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
`;

  // Create basic middleware 
  const middleware = baseSecurityMiddleware + `
export async function middleware(request: NextRequest) {
  // Basic middleware without security dependencies
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};`;

  fs.writeFileSync('middleware.ts', middleware);
}

async function installShadcnComponents(packageManager: string, components: ProjectConfig['components']) {
  console.log(chalk.yellow('🎨 Installing shadcn/ui components...'));
  
  try {
    // Initialize shadcn/ui (should detect package manager from existing setup)
    console.log(chalk.gray('  • Initializing shadcn/ui...'));
    const initCommand = 'npx shadcn@latest init --yes --force';
    execSync(initCommand, { stdio: 'inherit' });
    
    // Determine which shadcn components to install based on selections
    const shadcnComponents = new Set<string>();
    
    // Always install core components
    shadcnComponents.add('form');
    shadcnComponents.add('input');
    shadcnComponents.add('label');
    shadcnComponents.add('button');
    
    // Add components based on selections
    if (components.customInputs) {
      shadcnComponents.add('select');
      shadcnComponents.add('textarea');
    }
    
    if (components.dataTable) {
      shadcnComponents.add('table');
      shadcnComponents.add('checkbox'); // for row selection
    }
    
    if (components.fileUpload) {
      shadcnComponents.add('tooltip'); // FileUpload uses tooltips
    }
    
    if (components.dateTimeInput) {
      shadcnComponents.add('popover'); // DateTimePicker uses popovers
      shadcnComponents.add('calendar'); // DateTimePicker uses calendar
    }
    
    if (components.radioGroupInput) {
      shadcnComponents.add('radio-group'); // RadioGroup component
    }
    
    const componentsArray = Array.from(shadcnComponents);
    
    if (componentsArray.length === 0) {
      console.log(chalk.gray('  • No shadcn/ui components needed'));
      return;
    }
    
    console.log(chalk.gray(`  • Installing ${componentsArray.length} shadcn/ui components...`));
    for (const component of componentsArray) {
      try {
        const addCommand = `npx shadcn@latest add ${component} --yes`;
        execSync(addCommand, { stdio: 'pipe' }); // Use pipe to suppress individual output
        console.log(chalk.gray(`    ✓ ${component}`));
      } catch (error) {
        console.log(chalk.yellow(`    ⚠ Failed to install ${component}, continuing...`));
      }
    }
    
    console.log(chalk.green('✅ shadcn/ui components installed successfully!'));
    
  } catch (error) {
    console.log(chalk.red('❌ Failed to install shadcn/ui components automatically'));
    console.log(chalk.yellow('⚠️  You can install them manually later with: npx shadcn@latest add <component>'));
  }
}

async function createCustomComponents() {
  // Only create custom non-shadcn components now
  // shadcn/ui components will be installed via the CLI

  // Custom TextInput component
  const textInputComponent = `"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface TextInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: ClassValue;
    inputClassName?: ClassValue;
    type?: HTMLInputElement["type"];
    required?: boolean;
    onChange?: (value: string) => void;
    placeholder?: string;
    showLabel?: boolean;
}

export function TextInput<T extends FieldValues>({
    label,
    className,
    inputClassName,
    type = "text",
    name,
    disabled,
    required,
    onChange,
    placeholder,
    showLabel = true,
    ...props
}: TextInputProps<T>) {
    const { control } = useFormContext<T>();
    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    {showLabel && (
                        <FormLabel className="text-sm font-semibold text-[#181818]">
                            {label} {required && <span className="text-red-500">*</span>}
                        </FormLabel>
                    )}
                    <FormControl>
                        <Input
                            type={type}
                            disabled={disabled}
                            {...field}
                            className={cn(
                                "w-full justify-between overflow-hidden overflow-ellipsis whitespace-nowrap rounded-lg border-neutral-200 bg-white p-3 font-normal text-neutral-500 focus:ring-0 h-11 focus-visible:ring-0",
                                !field.value && "text-muted-foreground",
                                inputClassName
                            )}
                            onChange={(e) => {
                                // Basic input handling
                                const value = e.target.value;
                                field.onChange(value);
                                onChange?.(value);
                            }}
                            placeholder={placeholder}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;

  fs.writeFileSync('components/shared/inputs/TextInput.tsx', textInputComponent);

  // Custom TextInput component
  const checkboxInputComponent = `"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface CheckboxInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: string;
    required?: boolean;
    onChange?: (value: string) => void;
}

export function CheckboxInput<T extends FieldValues>({
    label,
    className,
    name,
    disabled,
    required,
    onChange,
    ...props
}: CheckboxInputProps<T>) {
    const { control } = useFormContext<T>();
    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    <div className="flex w-full flex-row items-center gap-2">
                        <FormControl>
                            <Checkbox
                                name={field.name}
                                checked={field.value}
                                onCheckedChange={(value) => {
                                    field.onChange(value);
                                    onChange?.(String(value));
                                }}
                                disabled={disabled}
                                className={cn("", className)}
                            />
                        </FormControl>
                        <FormLabel className="text-sm font-semibold text-[#181818]">
                            {label} {required && <span className="text-red-500">*</span>}
                        </FormLabel>

                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;

  fs.writeFileSync('components/shared/inputs/CheckboxInput.tsx', checkboxInputComponent);

  // Container component
  const containerComponent = `export default function Container({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={\`mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl \${className}\`}>
            {children}
        </div>
    );
}`;

  fs.writeFileSync('components/shared/Container.tsx', containerComponent);

  // Spinner component
  const spinnerComponent = `import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('flex-col items-center justify-center', {
    variants: {
        show: {
            true: 'flex',
            false: 'hidden',
        },
    },
    defaultVariants: {
        show: true,
    },
});

const loaderVariants = cva('animate-spin text-primary', {
    variants: {
        size: {
            small: 'size-6',
            medium: 'size-8',
            large: 'size-12',
        },
    },
    defaultVariants: {
        size: 'medium',
    },
});

interface SpinnerContentProps
    extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
    className?: string;
    children?: React.ReactNode;
}

export function Spinner({ size, show, children, className }: SpinnerContentProps) {
    return (
        <span className={spinnerVariants({ show })}>
            <Loader2 className={cn(loaderVariants({ size }), className)} />
            {children}
        </span>
    );
}`;

  fs.writeFileSync('components/shared/Spinner.tsx', spinnerComponent);
}

async function createSharedComponents(components: ProjectConfig['components']) {
  // Create selected shared components based on user choice
  
  // Create custom inputs if selected
  if (components.customInputs || components.fileUpload || components.dateTimeInput || components.radioGroupInput) {
    await createSharedInputs(components);
  }
  
  // Create data table if selected
  if (components.dataTable) {
    await createSharedDataTable();
  }
}

async function createSharedInputs(components: ProjectConfig['components']) {
  // Create input components based on user selection
  
  if (components.customInputs) {
    // SelectInput component
    const selectInputComponent = `"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface SelectInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: string;
    required?: boolean;
    placeholder?: string;
    options: { value: string | number | boolean; label: string }[];
    onChange?: (value: string | number | boolean) => void;
    valueType?: 'string' | 'number' | 'boolean';
}

export function SelectInput<T extends FieldValues>({
    label,
    className,
    name,
    disabled,
    required,
    placeholder = "Select...",
    options,
    onChange,
    valueType = 'string',
    ...props
}: SelectInputProps<T>) {
    const { control } = useFormContext<T>();

    const convertValue = (stringValue: string) => {
        switch (valueType) {
            case 'boolean': return stringValue === 'true';
            case 'number': return Number(stringValue);
            default: return stringValue;
        }
    };

    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    <FormLabel className="text-sm font-semibold text-[#181818]">
                        {label} {required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <Select
                        disabled={disabled}
                        onValueChange={(stringValue: string) => {
                            const convertedValue = convertValue(stringValue);
                            field.onChange(convertedValue);
                            onChange?.(convertedValue);
                        }}
                        value={field.value !== undefined ? String(field.value) : undefined}
                    >
                        <FormControl>
                            <SelectTrigger className="w-full h-11 rounded-lg border-neutral-200 bg-white p-3 focus:ring-0 focus-visible:ring-0">
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={String(option.value)} value={String(option.value)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;
    fs.writeFileSync('components/shared/inputs/SelectInput.tsx', selectInputComponent);

    // PasswordInput component
    const passwordInputComponent = `"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface PasswordInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: string;
    required?: boolean;
    placeholder?: string;
    onChange?: (value: string) => void;
    showStrengthIndicator?: boolean;
}

export function PasswordInput<T extends FieldValues>({
    label,
    className,
    name,
    disabled,
    required,
    placeholder = "Enter password",
    onChange,
    showStrengthIndicator = false,
    ...props
}: PasswordInputProps<T>) {
    const { control } = useFormContext<T>();
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const getStrengthLabel = (strength: number) => {
        switch (strength) {
            case 0: case 1: return "Weak";
            case 2: return "Fair";
            case 3: return "Good";
            case 4: return "Strong";
            case 5: return "Very Strong";
            default: return "Weak";
        }
    };

    const getStrengthColor = (strength: number) => {
        switch (strength) {
            case 0: case 1: return "bg-red-500";
            case 2: return "bg-yellow-500";
            case 3: return "bg-blue-500";
            case 4: return "bg-green-500";
            case 5: return "bg-green-600";
            default: return "bg-gray-300";
        }
    };

    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => {
                const strength = showStrengthIndicator ? getPasswordStrength(field.value || '') : 0;
                return (
                    <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                        <FormLabel className="text-sm font-semibold text-[#181818]">
                            {label} {required && <span className="text-red-500">*</span>}
                        </FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    disabled={disabled}
                                    {...field}
                                    className="w-full h-11 pr-10 rounded-lg border-neutral-200 bg-white p-3 focus:ring-0 focus-visible:ring-0"
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                        onChange?.(e.target.value);
                                    }}
                                    placeholder={placeholder}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </FormControl>
                        {showStrengthIndicator && field.value && (
                            <div className="space-y-2">
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={cn(
                                                "h-2 w-full rounded",
                                                level <= strength ? getStrengthColor(strength) : "bg-gray-200"
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Password strength: {getStrengthLabel(strength)}
                                </p>
                            </div>
                        )}
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}`;
    fs.writeFileSync('components/shared/inputs/PasswordInput.tsx', passwordInputComponent);

    // TextareaInput component
    const textareaInputComponent = `"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface TextareaInputProps<T extends FieldValues> extends UseControllerProps<T> {
    label: string;
    className?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    onChange?: (value: string) => void;
    showCharCount?: boolean;
}

export function TextareaInput<T extends FieldValues>({
    label,
    className,
    name,
    disabled,
    required,
    placeholder,
    rows = 4,
    maxLength,
    onChange,
    showCharCount = false,
    ...props
}: TextareaInputProps<T>) {
    const { control } = useFormContext<T>();

    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={cn("flex w-full flex-col gap-1", className)}>
                    <FormLabel className="text-sm font-semibold text-[#181818]">
                        {label} {required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                        <Textarea
                            disabled={disabled}
                            rows={rows}
                            maxLength={maxLength}
                            {...field}
                            className="w-full rounded-lg border-neutral-200 bg-white p-3 focus:ring-0 focus-visible:ring-0 resize-none"
                            onChange={(e) => {
                                field.onChange(e.target.value);
                                onChange?.(e.target.value);
                            }}
                            placeholder={placeholder}
                        />
                    </FormControl>
                    {showCharCount && (
                        <div className="flex justify-end">
                            <span className="text-sm text-gray-500">
                                {field.value?.length || 0}
                                {maxLength && \`/\${maxLength}\`}
                            </span>
                        </div>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}`;
    fs.writeFileSync('components/shared/inputs/TextareaInput.tsx', textareaInputComponent);
  }

  // FileUpload component
  if (components.fileUpload) {
    // Use source path relative to the CLI script location
    const sourcePath = path.resolve(__dirname, '../shared/inputs/FileUpload.tsx');
    const fileUploadSource = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync('components/shared/inputs/FileUpload.tsx', fileUploadSource);
  }

  // DateTimeInput component  
  if (components.dateTimeInput) {
    const sourcePath = path.resolve(__dirname, '../shared/inputs/DateTimeInput.tsx');
    const dateTimeInputSource = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync('components/shared/inputs/DateTimeInput.tsx', dateTimeInputSource);
  }

  // RadioGroupInput component
  if (components.radioGroupInput) {
    const sourcePath = path.resolve(__dirname, '../shared/inputs/RadioGroupInput.tsx');
    const radioGroupInputSource = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync('components/shared/inputs/RadioGroupInput.tsx', radioGroupInputSource);
  }
}

async function createSharedDataTable() {
  // Data table types
  const dataTableTypes = `import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export type DataType = 'string' | 'number' | 'date' | 'boolean';

export interface Column<T extends Record<string, unknown>> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    searchable?: boolean;
    dataType?: DataType;
    render?: (value: T[keyof T], row: T, index: number) => ReactNode;
    className?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export interface DataTableFilter {
    key: string;
    label: string;
    options: FilterOption[];
    placeholder?: string;
    width?: string;
    multiple?: boolean;
}

export interface SortState<T> {
    field: keyof T | null;
    direction: SortDirection;
}

export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export interface TableState<T extends Record<string, unknown>> {
    searchTerm: string;
    filterValues: Record<string, string | string[]>;
    sortState: SortState<T>;
    paginationState: PaginationState;
}

export interface DataTableProps<T extends Record<string, unknown> & { id?: string | number }> {
    data: T[];
    columns: Column<T>[];
    filters?: DataTableFilter[];
    searchPlaceholder?: string;
    searchShortcut?: string;
    itemsPerPage?: number;
    className?: string;
    loading?: boolean;
    error?: string | null;
    emptyStateMessage?: string;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
    stickyHeader?: boolean;
    onRowClick?: (row: T, index: number) => void;
    onRowDoubleClick?: (row: T, index: number) => void;
    onSelectionChange?: (selectedRows: T[]) => void;
    renderActions?: (row: T, index: number) => ReactNode;
    renderRowSubComponent?: (row: T) => ReactNode;
    getRowId?: (row: T, index: number) => string;
    isRowSelectable?: (row: T) => boolean;
    isRowExpandable?: (row: T) => boolean;
}

export interface UseTableStateProps<T extends Record<string, unknown>> {
    data: T[];
    columns: Column<T>[];
    filters?: DataTableFilter[];
    itemsPerPage?: number;
    initialSort?: SortState<T>;
}

export interface ProcessedData<T> {
    filteredData: T[];
    paginatedData: T[];
    totalItems: number;
    totalPages: number;
}`;

  fs.writeFileSync('components/shared/data-table/types/index.ts', dataTableTypes);

  // Data table main export
  const dataTableIndex = `export { DataTable } from './DataTable';

export type {
    Column,
    DataTableFilter,
    FilterOption,
    DataTableProps,
    SortDirection,
    DataType,
    SortState,
    PaginationState,
    TableState,
    ProcessedData
} from './types';

export { useTableState } from './hooks/useTableState';

export { TableFilters } from './components/TableFilters';
export { TablePagination } from './components/TablePagination';
export { TableEmptyState } from './components/TableEmptyState';

export {
    sortData,
    compareValues,
    parseValue
} from './utils/sorting';

export {
    getFilteredData,
    searchInRow,
    applyFilters
} from './utils/filtering';

export {
    calculatePagination,
    paginateData,
    generatePaginationItems
} from './utils/pagination';`;

  fs.writeFileSync('components/shared/data-table/index.tsx', dataTableIndex);

  // Create a basic DataTable implementation
  const dataTableComponent = `"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { DataTableProps } from "./types";
import { useTableState } from "./hooks/useTableState";
import { TableEmptyState } from "./components/TableEmptyState";
import { TableErrorState } from "./components/TableErrorState";
import { TableLoadingState } from "./components/TableLoadingState";
import { TablePagination } from "./components/TablePagination";
import { TableFilters } from "./components/TableFilters";

export function DataTable<T extends Record<string, unknown> & { id?: string | number }>({
    data,
    columns,
    filters = [],
    searchPlaceholder = "Search...",
    itemsPerPage = 10,
    className,
    loading = false,
    error = null,
    emptyStateMessage = "No data available",
    showSearch = true,
    showFilters = true,
    showPagination = true,
    onRowClick,
    renderActions,
    getRowId,
    ...props
}: DataTableProps<T>) {
    const {
        state,
        actions,
        processedData
    } = useTableState({
        data,
        columns,
        filters,
        itemsPerPage
    });

    if (loading) {
        return <TableLoadingState />;
    }

    if (error) {
        return <TableErrorState error={error} />;
    }

    return (
        <div className={cn("space-y-4", className)}>
            {(showSearch || showFilters) && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {showSearch && (
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={searchPlaceholder}
                                    value={state.searchTerm}
                                    onChange={(e) => actions.setSearchTerm(e.target.value)}
                                    className="pl-8 w-[250px]"
                                />
                            </div>
                        )}
                        {showFilters && filters.length > 0 && (
                            <TableFilters
                                filters={filters}
                                filterValues={state.filterValues}
                                onFilterChange={actions.setFilterValue}
                                onResetFilters={actions.resetFilters}
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={String(column.key)}
                                    className={cn(
                                        column.className,
                                        column.sortable && "cursor-pointer select-none",
                                        \`text-\${column.align || 'left'}\`
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && actions.toggleSort(column.key)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>{column.label}</span>
                                        {column.sortable && state.sortState.field === column.key && (
                                            <span className="text-xs">
                                                {state.sortState.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                            {renderActions && <TableHead className="w-[100px]">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedData.paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (renderActions ? 1 : 0)}
                                    className="h-24"
                                >
                                    <TableEmptyState message={emptyStateMessage} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            processedData.paginatedData.map((row, index) => {
                                const rowId = getRowId ? getRowId(row, index) : String(row.id || index);
                                
                                return (
                                    <TableRow
                                        key={rowId}
                                        className={onRowClick ? "cursor-pointer" : ""}
                                        onClick={() => onRowClick?.(row, index)}
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={String(column.key)}
                                                className={cn(
                                                    column.className,
                                                    \`text-\${column.align || 'left'}\`
                                                )}
                                            >
                                                {column.render
                                                    ? column.render(row[column.key], row, index)
                                                    : String(row[column.key] || '')}
                                            </TableCell>
                                        ))}
                                        {renderActions && (
                                            <TableCell>
                                                {renderActions(row, index)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && processedData.totalItems > 0 && (
                <TablePagination
                    currentPage={state.paginationState.currentPage}
                    totalPages={state.paginationState.totalPages}
                    totalItems={state.paginationState.totalItems}
                    itemsPerPage={state.paginationState.itemsPerPage}
                    onPageChange={actions.setPage}
                    onItemsPerPageChange={actions.setItemsPerPage}
                />
            )}
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/DataTable.tsx', dataTableComponent);

  // Create utility files and components with simplified implementations
  await createDataTableUtilities();
  await createDataTableComponents();
  await createDataTableHooks();
}

async function createDataTableUtilities() {
  // Sorting utilities
  const sortingUtils = `import type { SortDirection, DataType } from '../types';

export function parseValue(value: unknown, dataType?: DataType): any {
    if (value === null || value === undefined) return '';
    
    switch (dataType) {
        case 'number':
            return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        case 'date':
            return new Date(String(value));
        case 'boolean':
            return Boolean(value);
        default:
            return String(value).toLowerCase();
    }
}

export function compareValues(a: unknown, b: unknown, dataType?: DataType): number {
    const aVal = parseValue(a, dataType);
    const bVal = parseValue(b, dataType);
    
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
}

export function sortData<T extends Record<string, unknown>>(
    data: T[],
    field: keyof T,
    direction: SortDirection,
    dataType?: DataType
): T[] {
    return [...data].sort((a, b) => {
        const result = compareValues(a[field], b[field], dataType);
        return direction === 'asc' ? result : -result;
    });
}`;

  fs.writeFileSync('components/shared/data-table/utils/sorting.ts', sortingUtils);

  // Filtering utilities
  const filteringUtils = `import type { Column, DataTableFilter } from '../types';

export function searchInRow<T extends Record<string, unknown>>(
    row: T,
    searchTerm: string,
    searchableColumns: Array<keyof T>
): boolean {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return searchableColumns.some(key => {
        const value = row[key];
        return String(value || '').toLowerCase().includes(term);
    });
}

export function applyFilters<T extends Record<string, unknown>>(
    data: T[],
    filters: Record<string, string | string[]>
): T[] {
    return data.filter(row => {
        return Object.entries(filters).every(([key, filterValue]) => {
            if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
                return true;
            }
            
            const rowValue = String(row[key] || '');
            
            if (Array.isArray(filterValue)) {
                return filterValue.includes(rowValue);
            }
            
            return rowValue.includes(String(filterValue));
        });
    });
}

export function getFilteredData<T extends Record<string, unknown>>(
    data: T[],
    searchTerm: string,
    filters: Record<string, string | string[]>,
    columns: Column<T>[]
): T[] {
    let filteredData = [...data];
    
    // Apply search
    if (searchTerm) {
        const searchableColumns = columns
            .filter(col => col.searchable !== false)
            .map(col => col.key);
        filteredData = filteredData.filter(row =>
            searchInRow(row, searchTerm, searchableColumns)
        );
    }
    
    // Apply filters
    filteredData = applyFilters(filteredData, filters);
    
    return filteredData;
}`;

  fs.writeFileSync('components/shared/data-table/utils/filtering.ts', filteringUtils);

  // Pagination utilities
  const paginationUtils = `import type { PaginationState } from '../types';

export function calculatePagination(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
): PaginationState {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
    
    return {
        currentPage: validCurrentPage,
        itemsPerPage,
        totalItems,
        totalPages
    };
}

export function paginateData<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number
): T[] {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
}

export function generatePaginationItems(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
): Array<number | 'ellipsis'> {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const items: Array<number | 'ellipsis'> = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    if (currentPage <= halfVisible + 1) {
        // Show first pages
        for (let i = 1; i <= maxVisible - 1; i++) {
            items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
        // Show last pages
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
            items.push(i);
        }
    } else {
        // Show middle pages
        items.push(1);
        items.push('ellipsis');
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
            items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
    }
    
    return items;
}`;

  fs.writeFileSync('components/shared/data-table/utils/pagination.ts', paginationUtils);
}

async function createDataTableComponents() {
  // Table Empty State
  const emptyState = `import { FileX } from "lucide-react";

interface TableEmptyStateProps {
    message?: string;
}

export function TableEmptyState({ message = "No data available" }: TableEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <FileX className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TableEmptyState.tsx', emptyState);

  // Table Error State
  const errorState = `import { AlertCircle } from "lucide-react";

interface TableErrorStateProps {
    error: string;
}

export function TableErrorState({ error }: TableErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-red-600">{error}</p>
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TableErrorState.tsx', errorState);

  // Table Loading State
  const loadingState = `import { Spinner } from "@/components/shared/Spinner";

export function TableLoadingState() {
    return (
        <div className="flex items-center justify-center py-8">
            <Spinner size="medium" />
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TableLoadingState.tsx', loadingState);

  // Table Pagination
  const pagination = `import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}: TablePaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="h-8 w-[70px] rounded border border-input bg-background px-2 py-0 text-sm"
                >
                    {[10, 20, 30, 40, 50].map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>
            
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    {startItem}-{endItem} of {totalItems}
                </div>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                            currentPage <= 1 && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                            currentPage >= totalPages && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TablePagination.tsx', pagination);

  // Table Filters (simplified)
  const filters = `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFilter } from "../types";

interface TableFiltersProps {
    filters: DataTableFilter[];
    filterValues: Record<string, string | string[]>;
    onFilterChange: (key: string, value: string | string[]) => void;
    onResetFilters: () => void;
}

export function TableFilters({
    filters,
    filterValues,
    onFilterChange,
    onResetFilters
}: TableFiltersProps) {
    return (
        <div className="flex items-center space-x-2">
            {filters.map((filter) => (
                <Select
                    key={filter.key}
                    value={String(filterValues[filter.key] || '')}
                    onValueChange={(value) => onFilterChange(filter.key, value)}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={filter.placeholder || filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All {filter.label}</SelectItem>
                        {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}
            {Object.keys(filterValues).length > 0 && (
                <button
                    onClick={onResetFilters}
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}`;

  fs.writeFileSync('components/shared/data-table/components/TableFilters.tsx', filters);
}

async function createDataTableHooks() {
  // useTableState hook
  const tableStateHook = `import { useMemo, useState } from 'react';
import type { 
    UseTableStateProps, 
    TableState, 
    SortState, 
    ProcessedData,
    SortDirection 
} from '../types';
import { getFilteredData } from '../utils/filtering';
import { sortData } from '../utils/sorting';
import { paginateData, calculatePagination } from '../utils/pagination';

export function useTableState<T extends Record<string, unknown>>({
    data,
    columns,
    filters = [],
    itemsPerPage = 10,
    initialSort
}: UseTableStateProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({});
    const [sortState, setSortState] = useState<SortState<T>>(
        initialSort || { field: null, direction: 'asc' }
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);

    // Memoized processed data
    const processedData = useMemo<ProcessedData<T>>(() => {
        // Filter data
        let filteredData = getFilteredData(data, searchTerm, filterValues, columns);

        // Sort data
        if (sortState.field) {
            const column = columns.find(col => col.key === sortState.field);
            filteredData = sortData(
                filteredData,
                sortState.field,
                sortState.direction,
                column?.dataType
            );
        }

        // Calculate pagination
        const pagination = calculatePagination(
            filteredData.length,
            currentPage,
            currentItemsPerPage
        );

        // Paginate data
        const paginatedData = paginateData(
            filteredData,
            pagination.currentPage,
            currentItemsPerPage
        );

        return {
            filteredData,
            paginatedData,
            totalItems: filteredData.length,
            totalPages: pagination.totalPages
        };
    }, [data, columns, searchTerm, filterValues, sortState, currentPage, currentItemsPerPage]);

    const state: TableState<T> = {
        searchTerm,
        filterValues,
        sortState,
        paginationState: {
            currentPage,
            itemsPerPage: currentItemsPerPage,
            totalItems: processedData.totalItems,
            totalPages: processedData.totalPages
        }
    };

    const setFilterValue = (key: string, value: string | string[]) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filtering
    };

    const resetFilters = () => {
        setFilterValues({});
        setSearchTerm('');
        setCurrentPage(1);
    };

    const toggleSort = (field: keyof T) => {
        setSortState(prev => {
            if (prev.field === field) {
                const newDirection: SortDirection = prev.direction === 'asc' ? 'desc' : 'asc';
                return { field, direction: newDirection };
            }
            return { field, direction: 'asc' };
        });
        setCurrentPage(1); // Reset to first page when sorting
    };

    const setPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, processedData.totalPages)));
    };

    const setItemsPerPage = (items: number) => {
        setCurrentItemsPerPage(items);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const actions = {
        setSearchTerm: (term: string) => {
            setSearchTerm(term);
            setCurrentPage(1);
        },
        setFilterValue,
        setSortState,
        setPage,
        setItemsPerPage,
        resetFilters,
        toggleSort
    };

    return {
        state,
        actions,
        processedData
    };
}`;

  fs.writeFileSync('components/shared/data-table/hooks/useTableState.ts', tableStateHook);
}

async function createLibFiles(features: ProjectConfig['features']) {
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


async function createHooks() {
  // use-actions hook
  const useActionsFile = `import { useCallback, useState } from "react";

import { ActionState, FieldErrors } from '@/lib/create-safe-action';

type Action<TInput, TOutput> = (data: TInput) => Promise<ActionState<TInput, TOutput>>;

interface UseActionOptions<TOutput> {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
    onComplete?: () => void;
};

export const useAction = <TInput, TOutput>(
    action: Action<TInput, TOutput>,
    options: UseActionOptions<TOutput> = {},
) => {

    const [fieldErrors, setFieldErrors] = useState<FieldErrors<TInput> | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [data, setData] = useState<TOutput | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const execute = useCallback(
        async (input: TInput) => {
            setIsLoading(true);

            try {
                const result = await action(input);

                if (!result) {
                    return;
                }

                setFieldErrors(result.fieldErrors);

                if (result.error) {
                    setError(result.error);
                    options.onError?.(result.error);
                }

                if (result.data) {
                    setData(result.data);
                    options.onSuccess?.(result.data);
                }

            } finally {
                setIsLoading(false);
                options.onComplete?.();
            }
        },
        [action, options]
    );

    return {
        execute,
        fieldErrors,
        error,
        data,
        isLoading
    };
};`;

  fs.writeFileSync('hooks/use-actions.ts', useActionsFile);

  // Custom navigate hook
  const useCustomNavigateFile = `import { useRouter } from 'next/navigation';

type StateType = {
    [key: string]: string | number | boolean;
};

export const useCustomNavigate = () => {
    const router = useRouter();

    return (path: string, state?: StateType) => {
        const url = state
            ? \`\${path}?\${new URLSearchParams(state as Record<string, string>).toString()}\`
            : path;
        router.push(url);
        window.scroll(0, 0);
    };
};`;

  fs.writeFileSync('hooks/use-custom-navigate.ts', useCustomNavigateFile);
}

async function createStores() {
  // Form store
  const formStoreFile = `import { create } from 'zustand';

interface FormState {
    // Add your form state properties here
    isSubmitting: boolean;
    setIsSubmitting: (isSubmitting: boolean) => void;
    reset: () => void;
}

export const useFormStore = create<FormState>((set) => ({
    isSubmitting: false,
    setIsSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
    reset: () => set({ isSubmitting: false }),
}));`;

  fs.writeFileSync('stores/formStore.ts', formStoreFile);

  // Reset stores
  const resetStoresFile = `import { useCallback } from "react";
import { useFormStore } from "./formStore";

export const useResetStores = () => {
    const resetFormStore = useFormStore((state) => state.reset);

    return useCallback(() => {
        resetFormStore();
    }, [resetFormStore]);
};`;

  fs.writeFileSync('stores/resetStores.ts', resetStoresFile);
}

async function createActionsExample() {
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

async function createAppFiles(features: ProjectConfig['features']) {
  // Layout
  const layoutFile = `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Custom Stack App",
  description: "A full-stack Next.js application with custom tooling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`;

  fs.writeFileSync('app/layout.tsx', layoutFile);

  // Home page
  // Create dynamic feature badges based on user selections
  const featureBadges = [];
  
  // Always included core features
  featureBadges.push(
    '{ name: "Next.js 15", color: "bg-black text-white", icon: "⚡" }',
    '{ name: "TypeScript", color: "bg-blue-600 text-white", icon: "📘" }',
    '{ name: "Tailwind CSS", color: "bg-cyan-500 text-white", icon: "🎨" }',
    '{ name: "Shadcn UI", color: "bg-slate-800 text-white", icon: "🧩" }'
  );

  // Add optional features based on selection
  if (features.database) {
    featureBadges.push('{ name: "Prisma", color: "bg-indigo-600 text-white", icon: "🗄️" }');
  }
  if (features.betterAuth) {
    featureBadges.push('{ name: "Better Auth", color: "bg-green-600 text-white", icon: "🔐" }');
  }
  if (features.docker) {
    featureBadges.push('{ name: "Docker", color: "bg-blue-500 text-white", icon: "🐳" }');
  }
  if (features.nodemailer) {
    featureBadges.push('{ name: "Nodemailer", color: "bg-orange-600 text-white", icon: "📧" }');
  }
  if (features.husky) {
    featureBadges.push('{ name: "Husky", color: "bg-gray-700 text-white", icon: "🐕" }');
  }
  if (features.linting) {
    featureBadges.push('{ name: "ESLint + Prettier", color: "bg-yellow-600 text-white", icon: "✨" }');
  }

  const homePageFile = `"use client";

import { useState, useEffect } from 'react';
import Container from '@/components/shared/Container';
import Link from 'next/link';

const features = [
  ${featureBadges.join(',\n  ')}
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-32 right-10 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-32 left-20 w-72 h-72 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <Container>
        <div className="min-h-screen flex items-center justify-center py-12 relative z-10">
          <div className={\`max-w-5xl mx-auto text-center space-y-8 transform transition-all duration-1000 \${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}\`}>
            
            {/* Hero Section */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="mr-2 animate-pulse">🚀</span>
                Generated with Create WM Stack
              </div>
              
              <div className="space-y-4">
                <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight animate-fade-in">
                  WM STACK
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent animate-fade-in animation-delay-200">
                  Your Modern Full-Stack Foundation ✨
                </h2>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed animate-fade-in animation-delay-400">
                Your <span className="font-semibold text-blue-600">clean, production-ready</span> Next.js application is configured with your selected features.
                <span className="text-lg text-gray-600 block mt-4 animate-fade-in animation-delay-600">
                  Ready to build something amazing? Let's get started! 🎯
                </span>
              </p>
            </div>

            {/* Feature Showcase */}
            <div className="pt-8 animate-fade-in animation-delay-800">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Your Selected Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={\`group relative p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 \${feature.color.includes('bg-') ? feature.color : 'bg-gradient-to-br from-white to-gray-50'}\`}
                    style={{ animationDelay: \`\${index * 100}ms\` }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <div className="text-sm font-medium text-gray-800 text-center leading-tight">
                        {feature.name}
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Section */}
            <div className="pt-12 space-y-8 animate-fade-in animation-delay-1000">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                  <span className="relative z-10 flex items-center">
                    Start Building 🛠️
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
                
                <Link 
                  href="https://github.com/waelmanai/create-wm-stack" 
                  target="_blank" 
                  className="group px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:bg-white"
                >
                  <span className="flex items-center">
                    View on GitHub 
                    <svg className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
                  <div className="text-2xl font-bold text-blue-600">Next.js 15</div>
                  <div className="text-sm text-gray-600">App Router</div>
                </div>
                <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
                  <div className="text-2xl font-bold text-purple-600">TypeScript</div>
                  <div className="text-sm text-gray-600">Type Safe</div>
                </div>
                <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
                  <div className="text-2xl font-bold text-indigo-600">Tailwind</div>
                  <div className="text-sm text-gray-600">Styled</div>
                </div>
                <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
                  <div className="text-2xl font-bold text-green-600">Ready</div>
                  <div className="text-sm text-gray-600">to Deploy</div>
                </div>
              </div>
            </div>

            {/* Creator Section */}
            <div className="pt-16 border-t border-white/30 animate-fade-in animation-delay-1200">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    W
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>Crafted by</span>
                      <Link 
                        href="https://github.com/waelmanai" 
                        target="_blank" 
                        className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline"
                      >
                        Wael Manai
                      </Link>
                    </div>
                    <div className="text-sm text-gray-600">Full Stack Developer • Modern Web Tech Enthusiast</div>
                  </div>
                </div>
                
                <div className="mt-6 p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 backdrop-blur-sm rounded-2xl border-2 border-blue-200 max-w-4xl">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-white text-2xl">🚀</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start Building?</h4>
                      <div className="space-y-4 text-gray-700">
                        <p className="text-lg font-medium">
                          👉 <span className="font-bold text-blue-600">First step:</span> Customize this homepage!
                        </p>
                        <div className="bg-white/80 rounded-xl p-6 border border-blue-200">
                          <p className="text-base mb-3">
                            📁 Edit this file to make it your own:
                          </p>
                          <code className="block px-4 py-3 bg-gray-800 text-green-400 rounded-lg text-sm font-mono text-left">
                            app/page.tsx
                          </code>
                          <p className="text-sm text-gray-600 mt-3">
                            Replace this welcome page with your application's homepage
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                          <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
                            <p className="font-semibold text-purple-600 mb-2">🎨 Components</p>
                            <p className="text-sm text-gray-600">Explore <code className="bg-gray-200 px-2 py-1 rounded">components/</code> for UI components</p>
                          </div>
                          {features.some(f => f.name.includes('Prisma')) && (
                            <div className="bg-white/80 rounded-xl p-4 border border-indigo-200">
                              <p className="font-semibold text-indigo-600 mb-2">🗄️ Database</p>
                              <p className="text-sm text-gray-600">Configure <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code></p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="relative z-10 mt-16 py-8 border-t border-white/30">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <span>Built with ❤️ by</span>
              <Link 
                href="https://github.com/waelmanai" 
                target="_blank"
                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline flex items-center gap-1"
              >
                <span>Wael Manai</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              WM Stack • Modern Full-Stack Development Made Simple
            </p>
          </div>
        </footer>
      </Container>

      <style jsx>{\`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1200 {
          animation-delay: 1.2s;
        }
        
        .bg-grid-slate-100\/50 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.5)'%3e%3cpath d='m0 .5 32 0M.5 0v32'/%3e%3c/svg%3e");
        }
      \`}</style>
    </main>
  );
}`;

  fs.writeFileSync('app/page.tsx', homePageFile);

  // Error page
  const errorPageFile = `'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}`;

  fs.writeFileSync('app/error.tsx', errorPageFile);

  // Loading page
  const loadingPageFile = `import { Spinner } from '@/components/shared/Spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="large" />
    </div>
  );
}`;

  fs.writeFileSync('app/loading.tsx', loadingPageFile);

  // Not found page
  const notFoundPageFile = `import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-6xl font-bold mb-4">404</h2>
        <h3 className="text-2xl mb-4">Page Not Found</h3>
        <p className="mb-6">Could not find the requested resource.</p>
        <Link 
          href="/" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}`;

  fs.writeFileSync('app/not-found.tsx', notFoundPageFile);

  // Robots.txt
  const robotsTxtFile = `export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  };
}`;

  fs.writeFileSync('app/robots.ts', robotsTxtFile);

  // Sitemap
  const sitemapFile = `export default function sitemap() {
  return [
    {
      url: 'https://your-domain.com',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 1,
    },
    {
      url: 'https://your-domain.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];
}`;

  fs.writeFileSync('app/sitemap.ts', sitemapFile);
}

async function createPrismaFiles() {
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

async function createDockerFiles() {
  // Dockerfile
  const dockerfile = `FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* pnpm-lock.yaml* package-lock.json* ./
RUN \\
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \\
  elif [ -f package-lock.json ]; then npm ci; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]`;

  fs.writeFileSync('Dockerfile', dockerfile);

  // Docker compose
  const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - BETTER_AUTH_URL=http://localhost:3000
      - BETTER_AUTH_SECRET=your-secret-key
    depends_on:
      - db
    
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`;

  fs.writeFileSync('docker-compose.yml', dockerCompose);

  // .dockerignore
  const dockerignore = `node_modules
.next
.git
*.md
Dockerfile
.dockerignore
.env.local
.env.*.local`;

  fs.writeFileSync('.dockerignore', dockerignore);
}

async function setupAdditionalTools(packageManager: string) {
  try {
    // Setup Husky with new commands
    console.log(chalk.yellow('🔧 Setting up Husky...'));

    const huskyInitCommand = packageManager === 'yarn' ? 'yarn husky' :
      packageManager === 'pnpm' ? 'pnpm exec husky' : 'npx husky';

    // Create .husky directory and pre-commit hook
    fs.ensureDirSync('.husky');

    // Create pre-commit hook
    const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${packageManager === 'yarn' ? 'yarn lint-staged' :
        packageManager === 'pnpm' ? 'pnpm lint-staged' : 'npx lint-staged'}
`;

    fs.writeFileSync('.husky/pre-commit', preCommitHook);

    // Make it executable (Unix/Linux/Mac only)
    if (process.platform !== 'win32') {
      try {
        execSync('chmod +x .husky/pre-commit', { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.yellow('⚠️  Failed to make pre-commit hook executable'));
      }
    }

    console.log(chalk.green('✅ Husky configured!'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Husky setup failed. You can set it up manually later.'));
  }
}

async function createConstants() {
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

async function createTypes() {
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

async function createSchemas() {
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

// New Dynamic Installation Functions

async function createNextJSProject(projectName: string, packageManager: string, reactVersion: string) {
  console.log(chalk.yellow('🚀 Creating Next.js project with create-next-app...'));
  
  const reactFlag = reactVersion === '19' ? '' : ''; // For React 19, no special flag needed for create-next-app
  
  try {
    if (projectName === process.cwd().split(path.sep).pop()) {
      // Initialize in current directory
      execSync(`npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-${packageManager}`, { 
        stdio: 'inherit' 
      });
    } else {
      // Create new directory
      execSync(`npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-${packageManager}`, { 
        stdio: 'inherit' 
      });
    }
    console.log(chalk.green('✅ Next.js project created successfully!'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to create Next.js project'));
    process.exit(1);
  }
}

async function installPackages(packageManager: string, features: ProjectConfig['features'], reactVersion: string) {
  console.log(chalk.yellow('📦 Installing additional packages...'));
  
  const installCmd = packageManager === 'yarn' ? 'yarn add' :
                    packageManager === 'pnpm' ? 'pnpm add' : 'npm install';
  
  const devInstallCmd = packageManager === 'yarn' ? 'yarn add -D' :
                       packageManager === 'pnpm' ? 'pnpm add -D' : 'npm install --save-dev';

  try {
    // Install React version if needed
    if (reactVersion === '19') {
      console.log(chalk.blue('⚡ Upgrading to React 19...'));
      execSync(`${installCmd} react@beta react-dom@beta @types/react@beta @types/react-dom@beta`, { stdio: 'inherit' });
    }

    // Core packages (always latest)
    console.log(chalk.blue('📦 Installing core packages...'));
    execSync(`${installCmd} class-variance-authority@latest clsx@latest tailwind-merge@latest lucide-react@latest zustand@latest react-hook-form@latest @hookform/resolvers@latest zod@latest tailwindcss-animate@latest`, { stdio: 'inherit' });

    // Feature-based packages (always latest)
    if (features.database) {
      console.log(chalk.blue('🗄️ Installing Prisma...'));
      execSync(`${installCmd} @prisma/client@latest`, { stdio: 'inherit' });
      execSync(`${devInstallCmd} prisma@latest tsx@latest concurrently@latest`, { stdio: 'inherit' });
    }

    if (features.betterAuth) {
      console.log(chalk.blue('🔐 Installing Better Auth...'));
      execSync(`${installCmd} @better-auth/core@latest`, { stdio: 'inherit' });
    }

    if (features.nodemailer) {
      console.log(chalk.blue('📧 Installing Nodemailer...'));
      execSync(`${installCmd} nodemailer@latest @types/nodemailer@latest`, { stdio: 'inherit' });
    }

    if (features.linting) {
      console.log(chalk.blue('✨ Installing linting tools...'));
      execSync(`${devInstallCmd} prettier@latest prettier-plugin-tailwindcss@latest`, { stdio: 'inherit' });
    }

    if (features.husky) {
      console.log(chalk.blue('🪝 Installing Husky...'));
      execSync(`${devInstallCmd} husky@latest lint-staged@latest`, { stdio: 'inherit' });
    }

    console.log(chalk.green('✅ All packages installed successfully!'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to install packages'));
    console.log(chalk.yellow('Please install them manually or check your internet connection'));
  }
}

async function setupShadcnUI(packageManager: string, reactVersion: string) {
  console.log(chalk.yellow('🎨 Setting up shadcn/ui...'));
  
  try {
    // Initialize shadcn/ui with React version consideration
    if (reactVersion === '19') {
      console.log(chalk.blue('⚡ Configuring shadcn/ui for React 19...'));
      execSync(`npx shadcn@latest init --defaults --package-manager ${packageManager}`, { stdio: 'inherit' });
    } else {
      execSync(`npx shadcn@latest init --defaults --package-manager ${packageManager}`, { stdio: 'inherit' });
    }
    console.log(chalk.green('✅ shadcn/ui configured successfully!'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to setup shadcn/ui'));
    console.log(chalk.yellow('You can set it up manually later with: npx shadcn@latest init'));
  }
}

async function createProjectFiles(features: ProjectConfig['features'], components: ProjectConfig['components'], reactVersion: string) {
  console.log(chalk.yellow('📝 Creating project files...'));
  
  // Create folder structure first
  await createFolderStructure(features, components);
  
  // Create configuration files
  await createConfigFiles();
  
  // Create lib files
  await createLibFiles(features);
  
  // Create actions, stores, hooks
  await createActionsExample();
  await createStores();
  await createHooks();
  
  // Create app files (updated for React version)
  await createAppFiles(features);
  
  // Create components
  if (components.customInputs) {
    await createCustomComponents();
  }
  await createSharedComponents(components);
  
  // Create types and schemas
  await createConstants();
  await createTypes();
  await createSchemas();
  
  // Feature-specific files
  if (features.database) {
    await createPrismaFiles();
  }
  
  if (features.docker) {
    await createDockerFiles();
  }
  
  console.log(chalk.green('✅ Project files created successfully!'));
}

async function setupHusky(packageManager: string) {
  console.log(chalk.yellow('🪝 Setting up Husky git hooks...'));
  
  try {
    execSync(`${packageManager} run prepare`, { stdio: 'inherit' });
    console.log(chalk.green('✅ Husky configured successfully!'));
  } catch (error) {
    console.log(chalk.yellow('⚠️ Could not setup Husky automatically. Run "npm run prepare" manually after git init.'));
  }
}

createProject().catch(console.error);