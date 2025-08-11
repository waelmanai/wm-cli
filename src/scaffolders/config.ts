import fs from 'fs-extra';

export async function createConfigFiles() {
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