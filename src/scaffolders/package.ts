import fs from 'fs-extra';
import { ProjectConfig } from '../types';

export async function createPackageJson(projectName: string, packageManager: string, features: ProjectConfig['features'], components: ProjectConfig['components']) {
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
    'date-fns': 'latest', // Required for date components
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

  // Add component-specific dependencies
  if (components.priceInput) {
    dependencies['react-number-format'] = 'latest';
  }

  if (components.phoneInput) {
    dependencies['react-phone-number-input'] = 'latest';
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