import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'child_process';

export async function setupAdditionalTools(packageManager: string) {
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