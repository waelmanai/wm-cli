import chalk from 'chalk';
import { ProjectConfig } from '../types';
import { setupProjectDirectory, installPackages, displaySuccessMessage } from '../utils';
import { createPackageJson } from './package';
import { createFolderStructure } from './structure';
import { createConfigFiles } from './config';
import { createCoreFiles } from './core';
import { 
  createCustomComponents, 
  createSharedComponents,
  createSharedInputs,
  createSharedDataTable,
  createDataTableUtilities,
  createDataTableComponents,
  createDataTableHooks
} from './components';
import { createLibFiles } from './lib';
import { createActionsExample } from './actions';
import { createStores } from './stores';
import { createHooks } from './hooks';
import { createAppFiles } from './app';
import { createConstants, createTypes, createSchemas } from './metadata';
import { createDockerFiles } from './docker';
import { createPrismaFiles } from './database';
import { setupAdditionalTools } from './tools';
import { installShadcnComponents } from './shadcn';

export async function scaffoldProject(config: ProjectConfig) {
  const { projectName, packageManager, reactVersion, initInCurrentDir, features, components } = config;

  // Setup project directory
  setupProjectDirectory(config);

  // Create package.json
  await createPackageJson(projectName, packageManager, features, components);

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
  try {
    await installPackages(packageManager);
  } catch (error) {
    // Error already logged in installPackages function
    // Continue with the rest of the setup
  }

  // Setup additional tools based on selection
  if (features.husky) {
    await setupAdditionalTools(packageManager);
  }

  // Install shadcn/ui components after all dependencies are installed
  await installShadcnComponents(packageManager, components);

  // Display success message and next steps
  displaySuccessMessage(config);
}