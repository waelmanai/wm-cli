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
        { title: 'Custom Input Components (Basic inputs)', value: 'customInputs', selected: true },
        { title: 'File Upload Component', value: 'fileUpload', selected: false },
        { title: 'Date Time Input (Single date/time picker)', value: 'dateTimeInput', selected: false },
        { title: 'Date Range Input (Date range picker)', value: 'dateRangeInput', selected: false },
        { title: 'Number Input (Numeric input with validation)', value: 'numberInput', selected: false },
        { title: 'Price Input (Currency input with formatting)', value: 'priceInput', selected: false },
        { title: 'Phone Input (International phone number input)', value: 'phoneInput', selected: false },
        { title: 'Radio Group Input', value: 'radioGroupInput', selected: false }
      ]
    },
    {
      type: 'multiselect',
      name: 'hooks',
      message: 'Select custom hooks to include:',
      choices: [
        { title: 'useClickAway - Detect clicks outside element', value: 'useClickAway', selected: false },
        { title: 'useContinuousRetry - Auto-retry failed operations', value: 'useContinuousRetry', selected: false },
        { title: 'useCopyToClipboard - Copy text to clipboard', value: 'useCopyToClipboard', selected: false },
        { title: 'useDebounce - Debounce values', value: 'useDebounce', selected: true },
        { title: 'useEventListener - Add event listeners', value: 'useEventListener', selected: false },
        { title: 'useGeolocation - Get user location', value: 'useGeolocation', selected: false },
        { title: 'useHover - Track hover state', value: 'useHover', selected: false },
        { title: 'useIntersectionObserver - Track element visibility', value: 'useIntersectionObserver', selected: false },
        { title: 'useIsClient - Check if running on client', value: 'useIsClient', selected: true },
        { title: 'useIsFirstRender - Check if first render', value: 'useIsFirstRender', selected: false },
        { title: 'useKeyPress - Handle key press events', value: 'useKeyPress', selected: false },
        { title: 'useLocalStorage - Local storage state management', value: 'useLocalStorage', selected: true },
        { title: 'useLongPress - Handle long press events', value: 'useLongPress', selected: false },
        { title: 'useMediaQuery - Responsive media queries', value: 'useMediaQuery', selected: true },
        { title: 'useMouse - Track mouse position', value: 'useMouse', selected: false },
        { title: 'useOrientation - Track device orientation', value: 'useOrientation', selected: false },
        { title: 'usePageLeave - Detect page leave events', value: 'usePageLeave', selected: false },
        { title: 'useSessionStorage - Session storage state management', value: 'useSessionStorage', selected: false },
        { title: 'useThrottle - Throttle values', value: 'useThrottle', selected: false },
        { title: 'useTimeout - Handle timeouts', value: 'useTimeout', selected: false },
        { title: 'useToggle - Toggle boolean state', value: 'useToggle', selected: true },
        { title: 'useWindowScroll - Track window scroll', value: 'useWindowScroll', selected: false },
        { title: 'useWindowSize - Track window dimensions', value: 'useWindowSize', selected: false }
      ]
    },
    {
      type: 'multiselect',
      name: 'serverActions',
      message: 'Select server actions to include:',
      choices: [
        { title: 'Contact Management - Complete contact CRUD operations', value: 'contacts', selected: false }
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
      dateRangeInput: response.components.includes('dateRangeInput'),
      numberInput: response.components.includes('numberInput'),
      priceInput: response.components.includes('priceInput'),
      phoneInput: response.components.includes('phoneInput'),
      radioGroupInput: response.components.includes('radioGroupInput')
    },
    hooks: {
      useClickAway: response.hooks.includes('useClickAway'),
      useContinuousRetry: response.hooks.includes('useContinuousRetry'),
      useCopyToClipboard: response.hooks.includes('useCopyToClipboard'),
      useDebounce: response.hooks.includes('useDebounce'),
      useEventListener: response.hooks.includes('useEventListener'),
      useGeolocation: response.hooks.includes('useGeolocation'),
      useHover: response.hooks.includes('useHover'),
      useIntersectionObserver: response.hooks.includes('useIntersectionObserver'),
      useIsClient: response.hooks.includes('useIsClient'),
      useIsFirstRender: response.hooks.includes('useIsFirstRender'),
      useKeyPress: response.hooks.includes('useKeyPress'),
      useLocalStorage: response.hooks.includes('useLocalStorage'),
      useLongPress: response.hooks.includes('useLongPress'),
      useMediaQuery: response.hooks.includes('useMediaQuery'),
      useMouse: response.hooks.includes('useMouse'),
      useOrientation: response.hooks.includes('useOrientation'),
      usePageLeave: response.hooks.includes('usePageLeave'),
      useSessionStorage: response.hooks.includes('useSessionStorage'),
      useThrottle: response.hooks.includes('useThrottle'),
      useTimeout: response.hooks.includes('useTimeout'),
      useToggle: response.hooks.includes('useToggle'),
      useWindowScroll: response.hooks.includes('useWindowScroll'),
      useWindowSize: response.hooks.includes('useWindowSize')
    },
    serverActions: {
      contacts: response.serverActions.includes('contacts')
    }
  };

  await scaffoldProject(config);
}

createProject().catch(console.error);