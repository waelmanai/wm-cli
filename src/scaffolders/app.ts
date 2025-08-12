import fs from 'fs-extra';
import { ProjectConfig } from '../types';

export async function createAppFiles(features: ProjectConfig['features']) {
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

import Link from 'next/link';

const features = [
  ${featureBadges.join(',\n  ')}
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="inline-block px-4 py-2 bg-gray-800 rounded-lg text-sm">
            Generated with Create WM Stack
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold">
            Your App
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A clean, modern Next.js application ready for development.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-sm text-gray-300">{feature.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Get Started
            </button>
            
            <Link 
              href="https://github.com/waelmanai/create-wm-stack" 
              target="_blank" 
              className="px-6 py-3 border border-gray-700 text-white font-medium rounded-lg hover:border-gray-600 transition-colors"
            >
              View Source
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            Ready to build? Edit <code className="bg-gray-800 px-2 py-1 rounded">app/page.tsx</code> to get started.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-20 pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            Created by{' '}
            <Link 
              href="https://github.com/waelmanai" 
              target="_blank" 
              className="text-white hover:underline"
            >
              Wael Manai
            </Link>
          </p>
        </div>
      </div>
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-gray-400">An error occurred while loading this page.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}`;

  fs.writeFileSync('app/error.tsx', errorPageFile);

  // Loading page
  const loadingPageFile = `export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}`;

  fs.writeFileSync('app/loading.tsx', loadingPageFile);

  // Not found page
  const notFoundPageFile = `import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Not Found</h2>
        <p className="text-gray-400">Could not find the requested resource</p>
        <Link 
          href="/" 
          className="inline-block px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}`;

  fs.writeFileSync('app/not-found.tsx', notFoundPageFile);

  // Robots.txt
  const robotsFile = `User-agent: *
Allow: /

Sitemap: https://yourapp.com/sitemap.xml`;

  fs.writeFileSync('app/robots.txt', robotsFile);

  // Sitemap
  const sitemapFile = `import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://yourapp.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
  ]
}`;

  fs.writeFileSync('app/sitemap.ts', sitemapFile);
}