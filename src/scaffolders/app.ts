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