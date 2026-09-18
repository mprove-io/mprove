export type ComposerContentDirectoryAccessFailedError = {
  code: 'COMPOSER_CONTENT_DIRECTORY_ACCESS_FAILED';
  message: string;
  path: string;
  originalError: unknown;
};
