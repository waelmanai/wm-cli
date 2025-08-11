import chalk from 'chalk';
import { execSync } from 'child_process';
import type { ProjectConfig } from '../types';

export async function installShadcnComponents(packageManager: string, components: ProjectConfig['components']) {
  console.log(chalk.yellow('🎨 Installing shadcn/ui components...'));
  
  try {
    // Initialize shadcn/ui (should detect package manager from existing setup)
    console.log(chalk.gray('  • Initializing shadcn/ui...'));
    const initCommand = 'npx shadcn@latest init --yes --force';
    execSync(initCommand, { stdio: 'inherit' });
    
    // Determine which shadcn components to install based on selections
    const shadcnComponents = new Set<string>();
    
    // Always install core components
    shadcnComponents.add('form');
    shadcnComponents.add('input');
    shadcnComponents.add('label');
    shadcnComponents.add('button');
    
    // Add components based on selections
    if (components.customInputs) {
      shadcnComponents.add('select');
      shadcnComponents.add('textarea');
    }
    
    if (components.dataTable) {
      shadcnComponents.add('table');
      shadcnComponents.add('checkbox'); // for row selection
    }
    
    if (components.fileUpload) {
      shadcnComponents.add('tooltip'); // FileUpload uses tooltips
    }
    
    if (components.dateTimeInput) {
      shadcnComponents.add('popover'); // DateTimePicker uses popovers
      shadcnComponents.add('calendar'); // DateTimePicker uses calendar
    }
    
    if (components.dateRangeInput) {
      shadcnComponents.add('popover'); // DateRangeInput uses popovers
      shadcnComponents.add('calendar'); // DateRangeInput uses calendar
    }
    
    if (components.phoneInput) {
      shadcnComponents.add('command'); // PhoneInput uses command for search
      shadcnComponents.add('popover'); // PhoneInput uses popover for dropdown
      shadcnComponents.add('scroll-area'); // PhoneInput uses scroll area for long list
    }
    
    if (components.radioGroupInput) {
      shadcnComponents.add('radio-group'); // RadioGroup component
    }
    
    const componentsArray = Array.from(shadcnComponents);
    
    if (componentsArray.length === 0) {
      console.log(chalk.gray('  • No shadcn/ui components needed'));
      return;
    }
    
    console.log(chalk.gray(`  • Installing ${componentsArray.length} shadcn/ui components...`));
    for (const component of componentsArray) {
      try {
        const addCommand = `npx shadcn@latest add ${component} --yes`;
        execSync(addCommand, { stdio: 'pipe' }); // Use pipe to suppress individual output
        console.log(chalk.gray(`    ✓ ${component}`));
      } catch (error) {
        console.log(chalk.yellow(`    ⚠ Failed to install ${component}, continuing...`));
      }
    }
    
    console.log(chalk.green('✅ shadcn/ui components installed successfully!'));
    
  } catch (error) {
    console.log(chalk.red('❌ Failed to install shadcn/ui components automatically'));
    console.log(chalk.yellow('⚠️  You can install them manually later with: npx shadcn@latest add <component>'));
  }
}