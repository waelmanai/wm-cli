import fs from 'fs-extra';
import { ProjectConfig } from '../types';

export async function createFolderStructure(features: ProjectConfig['features'], components: ProjectConfig['components']) {
  // Base folders that are always needed
  const folders = [
    'actions',
    'app',
    'components/ui',
    'constants',
    'contexts',
    'hooks',
    'lib',
    'lib/security',
    'providers',
    'public/images',
    'public/icons',
    'schemas',
    'stores',
    'types',
    'utils'
  ];

  // Add conditional folders based on component selections
  if (components.customInputs || components.fileUpload || components.dateTimeInput || 
      components.dateRangeInput || components.numberInput || components.priceInput || 
      components.phoneInput || components.radioGroupInput) {
    folders.push('components/shared/inputs');
  }

  if (components.dataTable) {
    folders.push(
      'components/shared/data-table/components',
      'components/shared/data-table/hooks',
      'components/shared/data-table/utils',
      'components/shared/data-table/types'
    );
  }

  // Add database folder if needed
  if (features.database) {
    folders.push('prisma');
  }

  folders.forEach(folder => {
    fs.ensureDirSync(folder);
  });
}