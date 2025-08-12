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
  hooks: {
    useClickAway: boolean;
    useContinuousRetry: boolean;
    useCopyToClipboard: boolean;
    useDebounce: boolean;
    useEventListener: boolean;
    useGeolocation: boolean;
    useHover: boolean;
    useIntersectionObserver: boolean;
    useIsClient: boolean;
    useIsFirstRender: boolean;
    useKeyPress: boolean;
    useLocalStorage: boolean;
    useLongPress: boolean;
    useMediaQuery: boolean;
    useMouse: boolean;
    useOrientation: boolean;
    usePageLeave: boolean;
    useSessionStorage: boolean;
    useThrottle: boolean;
    useTimeout: boolean;
    useToggle: boolean;
    useWindowScroll: boolean;
    useWindowSize: boolean;
  };
}