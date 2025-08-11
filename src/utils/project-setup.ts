import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { ProjectConfig } from '../types';

/**
 * Validates and sets up the project directory
 */
export function setupProjectDirectory(config: ProjectConfig): void {
  const { projectName, initInCurrentDir } = config;

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
}

/**
 * Installs project dependencies using the specified package manager
 */
export async function installPackages(packageManager: string): Promise<void> {
  console.log(chalk.yellow('📦 Installing dependencies...'));
  
  try {
    const installCommand = packageManager === 'yarn' ? 'yarn install' :
      packageManager === 'pnpm' ? 'pnpm install' : 'npm install';

    execSync(installCommand, { stdio: 'inherit' });
    console.log(chalk.green('✅ Dependencies installed successfully!'));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to install dependencies. Please run ${packageManager} install manually.`));
    throw error; // Re-throw to allow caller to handle
  }
}

/**
 * Displays success message and next steps to the user
 */
export function displaySuccessMessage(config: ProjectConfig): void {
  const { projectName, packageManager, initInCurrentDir, features } = config;

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