export type ComposerMarkdownFileScanFailedError = {
  code: 'COMPOSER_MARKDOWN_FILE_SCAN_FAILED';
  message: string;
  path: string;
  originalError: unknown;
};
