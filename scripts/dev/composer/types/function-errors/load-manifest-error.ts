import type { DiscoverPathsError } from './discover-paths-error';
import type { ParseListedPathError } from './parse-listed-path-error';
import type { ReadTextFileError } from './read-text-file-error';
import type { ValidateDirectorySectionFilesExistError } from './validate-directory-section-files-exist-error';
import type { ValidateDiscoveredFilesAreListedError } from './validate-discovered-files-are-listed-error';
import type { ValidateListedFileNamesError } from './validate-listed-file-names-error';
import type { ValidateListedPathError } from './validate-listed-path-error';
import type { ValidateListedPathsAreDiscoveredError } from './validate-listed-paths-are-discovered-error';
import type { ValidateManifestPathsUniqueError } from './validate-manifest-paths-unique-error';

export type LoadManifestError =
  | ReadTextFileError
  | ParseListedPathError
  | ValidateListedPathError
  | ValidateListedFileNamesError
  | ValidateManifestPathsUniqueError
  | DiscoverPathsError
  | ValidateDirectorySectionFilesExistError
  | ValidateListedPathsAreDiscoveredError
  | ValidateDiscoveredFilesAreListedError;
