# Create WM Stack

A lightweight, flexible CLI tool to scaffold clean and modern Next.js applications with essential full-stack features. **Focus on code, not complexity** - get building faster.

> Created by **[Wael Manai](https://github.com/waelmanai)** 🚀

[![npm version](https://badge.fury.io/js/create-wm-stack.svg)](https://badge.fury.io/js/create-wm-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

```bash
# Create a new project
npx create-wm-stack@latest my-awesome-app

# Or initialize in current directory (if empty)
npx create-wm-stack@latest

# Use with different package managers
pnpm create wm-stack@latest my-app
yarn create wm-stack my-app
```

## 🎯 Interactive & Flexible Setup

Choose exactly what you need with our interactive setup:

```bash
🚀 Custom Full-Stack Next.js Generator
Creating a production-ready Next.js app with your custom stack

? Project name? my-awesome-app
? Which package manager would you like to use?
❯ pnpm (recommended)
  yarn
  npm
? Which React version would you like to use?
❯ React 18 (Stable LTS - Recommended)
  React 19 (Latest - Experimental features)
? Select features to include:
❯ ◉ Database (Prisma)
  ◉ Docker Configuration
  ◉ Git Hooks (Husky)
  ◉ Linting & Formatting
  ◯ Email (Nodemailer)
  ◉ Authentication (Better Auth)
? Select components to include:
❯ ◉ Data Table (Advanced table with filtering/sorting)
  ◉ Custom Input Components
  ◯ File Upload Component
  ◯ Date Time Input
  ◯ Radio Group Input
```

## ✨ What's Included

This CLI creates a **clean**, modern Next.js application with essential features you choose:

### 🏗️ **Core Stack** _(Always Included)_

- **Next.js 15** with App Router
- **TypeScript** with strict configuration
- **Tailwind CSS** for styling
- **Shadcn UI** for beautiful components (only installs components you actually use)
- **Zustand** for global state management
- **React Hook Form** with **Zod** validation
- Custom type-safe server actions
- **Clean, minimal codebase** - Focus on your business logic

### 🛠️ **Optional Features** _(Choose What You Need)_

- **🗄️ Database (Prisma)** - PostgreSQL with type-safe ORM
- **🐳 Docker Configuration** - Multi-stage production builds
- **🪝 Git Hooks (Husky)** - Pre-commit linting and formatting
- **✨ Linting & Formatting** - ESLint, Prettier, TypeScript checks
- **📧 Email (Nodemailer)** - SMTP email functionality
- **🔐 Authentication (Better Auth)** - Complete auth system with OAuth

## ⚡ **Powerful Server Actions Architecture**

**Every generated project includes a robust, type-safe server actions system:**

### 🛡️ **Safe Actions Pattern**

The CLI generates a powerful `createSafeAction` utility that provides:

```typescript
// lib/create-safe-action.ts - Generated automatically
import { z } from 'zod';

export type FieldErrors<T> = {
  [K in keyof T]?: string[];
};

export type ActionState<TInput, TOutput> = {
  fieldErrors?: FieldErrors<TInput>;
  error?: string | null;
  data?: TOutput;
};

// Type-safe action creator with automatic validation
export const createSafeAction = <TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (validatedData: TInput) => Promise<ActionState<TInput, TOutput>>
) => {
  return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
    const validationResult = schema.safeParse(data);
    
    if (!validationResult.success) {
      return {
        fieldErrors: validationResult.error.flatten().fieldErrors as FieldErrors<TInput>,
      };
    }

    return handler(validationResult.data);
  };
};
```

### 🎯 **useActions Hook**

A powerful custom hook for managing server action states:

```typescript
// hooks/use-actions.ts - Generated automatically
import { useCallback, useState } from "react";
import { ActionState, FieldErrors } from '@/lib/create-safe-action';

interface UseActionOptions<TOutput> {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
    onComplete?: () => void;
}

export const useAction = <TInput, TOutput>(
    action: (data: TInput) => Promise<ActionState<TInput, TOutput>>,
    options: UseActionOptions<TOutput> = {}
) => {
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<TInput> | undefined>();
    const [error, setError] = useState<string | undefined>();
    const [data, setData] = useState<TOutput | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const execute = useCallback(async (input: TInput) => {
        setIsLoading(true);
        
        try {
            const result = await action(input);
            
            if (!result) return;
            
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
    }, [action, options]);

    return {
        execute,
        fieldErrors,
        error,
        data,
        isLoading
    };
};
```

### 🔥 **Example Usage**

**1. Define Your Schema & Action:**
```typescript
// actions/create-user.ts
import { z } from 'zod';
import { createSafeAction } from '@/lib/create-safe-action';

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be at least 18')
});

export const createUser = createSafeAction(
  CreateUserSchema,
  async (data) => {
    try {
      // Your server logic here
      const user = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          age: data.age,
        }
      });

      return { data: user };
    } catch (error) {
      return { error: 'Failed to create user' };
    }
  }
);
```

**2. Use in Your Components:**
```typescript
// components/CreateUserForm.tsx
"use client";

import { useAction } from '@/hooks/use-actions';
import { createUser } from '@/actions/create-user';
import { Button } from '@/components/ui/button';

export function CreateUserForm() {
  const { execute, fieldErrors, error, isLoading } = useAction(createUser, {
    onSuccess: (data) => {
      console.log('User created:', data);
      toast.success('User created successfully!');
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const handleSubmit = async (formData: FormData) => {
    await execute({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      age: parseInt(formData.get('age') as string)
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="Name" />
      {fieldErrors?.name && <span className="error">{fieldErrors.name}</span>}
      
      <input name="email" placeholder="Email" />
      {fieldErrors?.email && <span className="error">{fieldErrors.email}</span>}
      
      <input name="age" type="number" placeholder="Age" />
      {fieldErrors?.age && <span className="error">{fieldErrors.age}</span>}
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </Button>
      
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### 🌟 **Key Benefits**

✅ **Type Safety** - Full TypeScript support with automatic type inference  
✅ **Automatic Validation** - Zod schema validation with detailed error messages  
✅ **Error Handling** - Structured error handling for both field and general errors  
✅ **Loading States** - Built-in loading state management  
✅ **Reusable** - Create actions once, use anywhere in your app  
✅ **Server-Side** - True server-side execution with Next.js App Router  
✅ **Performance** - No client-side JavaScript for form validation  
✅ **Developer Experience** - Excellent IntelliSense and type checking  

### 📁 **Generated File Structure**

```
your-project/
├── lib/
│   └── create-safe-action.ts     # Core safe action utility
├── hooks/
│   └── use-actions.ts            # React hook for managing actions
├── actions/
│   └── example-actions.ts        # Example server actions
└── components/
    └── forms/                    # Example forms using the pattern
```

> 🚀 **Pro Tip**: This pattern scales perfectly from simple forms to complex multi-step workflows!

## 📝 **React Hook Form Integration**

**Every generated project comes with React Hook Form + Zod validation for powerful form handling:**

### 🔥 **Complete Form Example with React Hook Form**

**1. Define Your Schema:**
```typescript
// schemas/user-schema.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Age must be realistic'),
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
  bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

**2. Create Server Action:**
```typescript
// actions/create-user.ts
'use server';

import { z } from 'zod';
import { createSafeAction } from '@/lib/create-safe-action';
import { CreateUserSchema } from '@/schemas/user-schema';
import { prisma } from '@/lib/db';

export const createUser = createSafeAction(
  CreateUserSchema,
  async (data) => {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return { error: 'User with this email already exists' };
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          age: data.age,
          role: data.role,
          bio: data.bio
        }
      });

      return { data: { id: user.id, name: user.name, email: user.email } };
    } catch (error) {
      return { error: 'Failed to create user. Please try again.' };
    }
  }
);
```

**3. Advanced Form Component with React Hook Form:**
```typescript
// components/forms/CreateUserForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from '@/hooks/use-actions';
import { createUser } from '@/actions/create-user';
import { CreateUserSchema, CreateUserInput } from '@/schemas/user-schema';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export function CreateUserForm() {
  // React Hook Form setup with Zod validation
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 18,
      role: 'user',
      bio: '',
      terms: false
    }
  });

  // Server action hook
  const { execute, isLoading } = useAction(createUser, {
    onSuccess: (data) => {
      toast.success(`User ${data.name} created successfully!`);
      form.reset();
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const onSubmit = async (data: CreateUserInput) => {
    await execute(data);
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create New User</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age Field */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter your age"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Select */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio Textarea (Optional) */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about yourself..." 
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms Checkbox */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I accept the terms and conditions
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating User...' : 'Create User'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

### 🚀 **Advanced Form Patterns**

**1. Dynamic Form Fields:**
```typescript
// Dynamic array of fields
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    skills: [{ name: '', level: 'beginner' }]
  }
});

// Add/remove fields dynamically
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "skills"
});
```

**2. Dependent Fields:**
```typescript
// Watch field changes and react
const watchRole = form.watch('role');

// Conditional validation based on role
const ConditionalSchema = z.object({
  role: z.enum(['admin', 'user']),
  adminKey: z.string().optional()
}).refine(data => {
  if (data.role === 'admin' && !data.adminKey) {
    return false;
  }
  return true;
}, {
  message: "Admin key is required for admin role",
  path: ['adminKey']
});
```

**3. Multi-step Form:**
```typescript
export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange' // Validate on change for better UX
  });

  const nextStep = async () => {
    const isStepValid = await form.trigger(getFieldsForStep(step));
    if (isStepValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  return (
    <Form {...form}>
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span>Step {step} of 3</span>
          <div className="flex space-x-2">
            {[1, 2, 3].map(s => (
              <div 
                key={s}
                className={`w-3 h-3 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {step === 1 && <PersonalInfoStep />}
      {step === 2 && <ContactInfoStep />}
      {step === 3 && <PreferencesStep />}
      
      <div className="flex justify-between mt-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
        >
          Previous
        </Button>
        
        {step < 3 ? (
          <Button type="button" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        )}
      </div>
    </Form>
  );
}
```

### 🎯 **Form Best Practices Built-In**

✅ **Automatic Validation** - Real-time validation with Zod schemas  
✅ **Type Safety** - Full TypeScript integration  
✅ **Error Handling** - Detailed field-level and form-level errors  
✅ **Loading States** - Built-in loading indicators  
✅ **Accessibility** - ARIA labels and screen reader support  
✅ **Performance** - Optimized re-renders with React Hook Form  
✅ **Server Integration** - Seamless server action integration  
✅ **User Experience** - Smooth form interactions and feedback  

### 📊 **Generated Form Components**

Every project includes these enhanced form components:
- **TextInput** - Enhanced text input with validation states
- **SelectInput** - Searchable select with custom styling  
- **PasswordInput** - Password field with show/hide toggle
- **TextareaInput** - Auto-resizing textarea with character count
- **FileUpload** - Drag-and-drop file upload with preview
- **DateTimeInput** - Calendar picker with time selection
- **RadioGroupInput** - Custom-styled radio groups

### 🧩 **Modular Components** _(Mix & Match)_

- **📊 Advanced Data Table** - Filtering, sorting, pagination
- **📝 Enhanced Form Inputs** - Select, Password, Textarea with features
- **📁 File Upload Component** - Drag-and-drop with preview
- **📅 Date Time Picker** - Calendar integration
- **🔘 Radio Group Components** - Custom styling

> 💡 **Smart Installation**: Only installs packages and components you actually selected!

## 🚀 **Lightweight & Fast**

**Every project focuses on essential features with clean code:**

✅ **Minimal Dependencies** - Only install what you actually need  
✅ **Clean Architecture** - Well-organized code structure  
✅ **Type Safety** - Full TypeScript support throughout  
✅ **Modern Patterns** - Latest Next.js 15 App Router features  
✅ **Stable Versions** - Uses specific package versions for reproducible builds  
✅ **Developer Experience** - Great tooling and fast development  
✅ **Production Ready** - Optimized builds and deployment-ready  

> 🚀 **Focus on Building**: Less setup, more coding!

## 🎯 Why Choose This Flexible Approach?

✅ **Lean Projects** - No bloated dependencies or unused components  
✅ **Faster Installation** - Only install what you need  
✅ **Cleaner Codebase** - No dead code or unnecessary files  
✅ **Better Performance** - Smaller bundle sizes  
✅ **Easy Maintenance** - Less complexity, easier to understand  
✅ **Modular Growth** - Add features later as your project evolves  

## 📦 **Dynamic Package Installation**

**Every generated project uses the truly latest package versions through dynamic installation:**

✅ **Always Latest** - Uses `create-next-app@latest` and `@latest` for all packages  
✅ **Real-time Updates** - Gets the actual latest versions at installation time  
✅ **Official Sources** - Uses each package's recommended installation method  
✅ **React Version Choice** - Only React has version choice (18 stable vs 19 beta)  
✅ **No Maintenance** - No manual version updates needed in the CLI  
✅ **True Latest** - Every other package uses `@latest` tag for newest version  

**How It Works:**
1. **Base Project**: `npx create-next-app@latest` with TypeScript, ESLint, Tailwind
2. **React Version**: Choose React 18 (stable) or React 19 (with beta packages)
3. **Latest Packages**: All packages installed with `@latest` tag for newest versions
4. **shadcn/ui**: `npx shadcn@latest init` with React 19 compatibility
5. **Feature Packages**: Prisma, Better Auth, etc. installed with their latest versions

**Example Installation Commands:**
- **Core**: `npm install zod@latest react-hook-form@latest zustand@latest lucide-react@latest`
- **Database**: `npm install @prisma/client@latest && npm install -D prisma@latest`
- **Auth**: `npm install better-auth@latest`
- **Email**: `npm install nodemailer@latest @types/nodemailer@latest`

> 🚀 **Result**: You always get the absolute latest versions without CLI updates!

### 📊 Package Size Comparison

| Setup                    | Node Modules | Components     | Build Time |
| ------------------------ | ------------ | -------------- | ---------- |
| **Everything Included**  | ~800MB       | 15+ components | 45s        |
| **Database + Auth Only** | ~400MB       | 6 components   | 25s        |
| **Minimal (Core Only)**  | ~200MB       | 3 components   | 15s        |

## 🔧 Available Scripts

**Scripts are automatically configured based on your selections:**

### 🏗️ Core Scripts _(Always Available)_
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### ✨ If You Choose Linting & Formatting
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run type-check   # Type check with TypeScript
```

### 🗄️ If You Choose Database
```bash
npm run db:push      # Push database schema
npm run db:seed      # Seed database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run setup        # Install, setup DB, seed, and start dev server
npm run dev:studio   # 🚀 Run dev server + prisma studio in parallel
```

### 🪝 If You Choose Husky
```bash
npm run prepare      # Setup git hooks
```


## ⚡ Quick Setup

**The setup process adapts to your selections:**

1. **Navigate to your project:**
   ```bash
   cd my-awesome-app
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your actual values. **Only variables for features you selected will be included:**

   ```env
   # Core variables (always included)
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   
   # Database (if selected)
   DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
   
   # Authentication (if selected) 
   BETTER_AUTH_URL="http://localhost:3000"
   BETTER_AUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Email (if selected)
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   SMTP_FROM_NAME="Your App Name"
   SMTP_FROM_EMAIL="noreply@yourapp.com"
   ```

3. **Start development:**
   ```bash
   npm run setup    # If you chose database
   # OR
   npm run dev      # For minimal setups
   ```

## 🗄️ Database Management

**Only available if you choose Database (Prisma):**

### 🚀 **Dual Terminal Magic**

When you select the database feature, you get a special script that opens **2 terminals in parallel**:

```bash
npm run dev:studio
```

This simultaneously runs:
- **Terminal 1**: `next dev` (development server)
- **Terminal 2**: `prisma studio` (database GUI)

No more manual terminal switching! 🎉

```bash
# Push schema changes
npm run db:push

# Generate client after schema changes
npm run db:generate

# Seed database with initial data
npm run db:seed

# Open Prisma Studio for data management
npm run db:studio
```

## 🔐 Authentication Setup

**Only available if you choose Authentication (Better Auth):**

The generated project includes Better Auth with:
- **Email/Password authentication**
- **Google OAuth integration**
- **Session management**
- **Protected routes middleware**

Configure your OAuth providers in `.env.local`:
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 📧 Email Configuration

**Only available if you choose Email (Nodemailer):**

```typescript
import { sendEmail } from "@/lib/email";

await sendEmail("user@example.com", "Welcome!", "<h1>Welcome to our app!</h1>");
```

Configure SMTP in `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME="Your App Name"
SMTP_FROM_EMAIL=noreply@yourapp.com
```


## 🐳 Docker Support

**Only available if you choose Docker Configuration:**

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t my-app .
docker run -p 3000:3000 my-app
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Docker Production
```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Created By

**Wael Manai** - Full Stack Developer  
🔗 GitHub: [https://github.com/waelmanai](https://github.com/waelmanai)  
💼 Building modern web applications with passion

## 🆘 Support

- 📚 [Documentation](https://github.com/waelmanai/create-wm-stack#readme)
- 🐛 [Report Issues](https://github.com/waelmanai/create-wm-stack/issues)
- 💬 [Discussions](https://github.com/waelmanai/create-wm-stack/discussions)

## ⭐ Show Your Support

If this tool helps you, please give it a star on [GitHub](https://github.com/waelmanai/create-wm-stack)!

---

**Happy coding! 🚀**

_Created with ❤️ by [Wael Manai](https://github.com/waelmanai) for the Next.js community_