import type { ComposerArgumentCountInvalidError } from './composer-argument-count-invalid-error';
import type { ComposerDirectorySectionFileMissingError } from './composer-directory-section-file-missing-error';
import type { ComposerDirectorySectionScanFailedError } from './composer-directory-section-scan-failed-error';
import type { ComposerIgnoredPathReferencedError } from './composer-ignored-path-referenced-error';
import type { ComposerManifestOutputPathConflictError } from './composer-manifest-output-path-conflict-error';
import type { ComposerManifestPathDuplicateError } from './composer-manifest-path-duplicate-error';
import type { ComposerManifestPathInvalidError } from './composer-manifest-path-invalid-error';
import type { ComposerManifestReferencesMissingFileError } from './composer-manifest-references-missing-file-error';
import type { ComposerMarkdownFileScanFailedError } from './composer-markdown-file-scan-failed-error';
import type { ComposerMarkdownFileUnreferencedError } from './composer-markdown-file-unreferenced-error';
import type { ComposerMarkdownTitleMismatchError } from './composer-markdown-title-mismatch-error';
import type { ComposerOutputWriteFailedError } from './composer-output-write-failed-error';
import type { ComposerSourceDirectoryAccessFailedError } from './composer-source-directory-access-failed-error';
import type { ComposerSourceFileNameInvalidError } from './composer-source-file-name-invalid-error';
import type { ComposerSourcePathNotDirectoryError } from './composer-source-path-not-directory-error';
import type { ComposerTextFileReadFailedError } from './composer-text-file-read-failed-error';

export type ComposerError =
  | ComposerArgumentCountInvalidError
  | ComposerDirectorySectionFileMissingError
  | ComposerDirectorySectionScanFailedError
  | ComposerIgnoredPathReferencedError
  | ComposerManifestOutputPathConflictError
  | ComposerManifestPathDuplicateError
  | ComposerManifestPathInvalidError
  | ComposerManifestReferencesMissingFileError
  | ComposerMarkdownFileScanFailedError
  | ComposerMarkdownFileUnreferencedError
  | ComposerMarkdownTitleMismatchError
  | ComposerOutputWriteFailedError
  | ComposerSourceDirectoryAccessFailedError
  | ComposerSourceFileNameInvalidError
  | ComposerSourcePathNotDirectoryError
  | ComposerTextFileReadFailedError;
