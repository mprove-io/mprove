export type ComposerSourceDirectoryAccessFailedError = {
  code: 'COMPOSER_SOURCE_DIRECTORY_ACCESS_FAILED';
  message: string;
  path: string;
  originalError: unknown;
};
