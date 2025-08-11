#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { scaffoldProject } from './src/scaffolders';
import type { ProjectConfig } from './src/types';

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

createProject().catch(console.error);