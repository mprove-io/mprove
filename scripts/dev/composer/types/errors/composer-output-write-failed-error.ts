export type ComposerOutputWriteFailedError = {
  code: 'COMPOSER_OUTPUT_WRITE_FAILED';
  message: string;
  outputPath: string;
  temporaryOutputPath: string;
  originalError: unknown;
};
