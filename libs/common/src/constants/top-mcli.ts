export const APP_NAME_MCLI = 'MCLI';

export const POSSIBLE_TIME_DIFF_MS = 1000;

export const MCLI_E2E_RETRY_OPTIONS = {
  retries: 2, // (default 10)
  minTimeout: 1000, // ms (default 1000)
  factor: 1, // (default 2)
  randomize: true, // 1 to 2 (default true)
  onRetry: (e: any, attempt: number) => {
    console.log(`Retry attempt ${attempt}:`, e.message);
  }
};
