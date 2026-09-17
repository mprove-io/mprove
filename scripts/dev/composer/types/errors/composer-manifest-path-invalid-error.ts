export type ComposerManifestPathInvalidError = {
  code: 'COMPOSER_MANIFEST_PATH_INVALID';
  message: string;
  manifestPath: string;
};
