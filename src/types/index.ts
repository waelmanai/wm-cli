export interface ProjectConfig {
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  reactVersion: '18' | '19';
  initInCurrentDir: boolean;
  features: {
    database: boolean;
    docker: boolean;
    husky: boolean;
    linting: boolean;
    nodemailer: boolean;
    betterAuth: boolean;
  };
  components: {
    dataTable: boolean;
    customInputs: boolean;
    fileUpload: boolean;
    dateTimeInput: boolean;
    dateRangeInput: boolean;
    numberInput: boolean;
    priceInput: boolean;
    phoneInput: boolean;
    radioGroupInput: boolean;
  };
}