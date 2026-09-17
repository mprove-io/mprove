export type ComposerDirectorySectionScanFailedError = {
  code: 'COMPOSER_DIRECTORY_SECTION_SCAN_FAILED';
  message: string;
  path: string;
  originalError: unknown;
};
