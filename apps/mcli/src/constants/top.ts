export const APP_NAME_MCLI = 'MCLI';

export const POSSIBLE_TIME_DIFF_MS = 1000;

export const RETRY_OPTIONS = {
  retries: 2, // (default 10)
  minTimeout: 1000, // ms (default 1000)
  factor: 1, // (default 2)
  randomize: true, // 1 to 2 (default true)
  onRetry: (e: any) => {
    // logToConsoleMcli({
    //   log: new common.ServerError({
    //     message: common.ErEnum.MCLI_TEST_RETRY,
    //     originalError: e
    //   }),
    //   logLevel: common.LogLevelEnum.Error,
    //   context: undefined,
    //   isJson: false
    // });
  }
};
