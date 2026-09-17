export type ComposerTextFileReadFailedError = {
  code: 'COMPOSER_TEXT_FILE_READ_FAILED';
  message: string;
  path: string;
  originalError: unknown;
};
