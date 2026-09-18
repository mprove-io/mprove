import { Result } from '@praha/byethrow';
import { readTextFile } from '../../shared/read-text-file/read-text-file';
import type { ContentPaths } from '../../types/content-paths';
import type { GetContentPathsError } from '../../types/function-errors/get-content-paths-error';
import type { LoadManifestError } from '../../types/function-errors/load-manifest-error';
import type { ParseManifestError } from '../../types/function-errors/parse-manifest-error';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';
import type { ValidateManifestFilesExistError } from '../../types/function-errors/validate-manifest-files-exist-error';
import type { ValidateMarkdownFilesReferencedError } from '../../types/function-errors/validate-markdown-files-referenced-error';
import type { Manifest } from '../../types/manifest';
import { getContentPaths } from './get-content-paths/get-content-paths';
import { parseManifest } from './parse-manifest/parse-manifest';
import { validateDirectorySectionFilesExist } from './validate-directory-section-files-exist/validate-directory-section-files-exist';
import { validateManifestFilesExist } from './validate-manifest-files-exist/validate-manifest-files-exist';
import { validateMarkdownFilesReferenced } from './validate-markdown-files-referenced/validate-markdown-files-referenced';

export function loadManifest(item: {
  contentDirectory: string;
  manifestPath: string;
}): Result.Result<Manifest, LoadManifestError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'content',
      (v): Result.Result<string, ReadTextFileError> =>
        readTextFile({ filePath: v.manifestPath })
    ),
    Result.bind(
      'manifest',
      (v): Result.Result<Manifest, ParseManifestError> =>
        parseManifest({
          content: v.content,
          manifestPath: v.manifestPath
        })
    ),
    Result.bind(
      'contentPaths',
      (v): Result.Result<ContentPaths, GetContentPathsError> =>
        getContentPaths({ contentDirectory: v.contentDirectory })
    ),
    Result.andThrough(v =>
      validateDirectorySectionFilesExist({
        contentDirectory: v.contentDirectory,
        directoryRelativePaths: v.contentPaths.directoryRelativePaths,
        markdownRelativePaths: v.contentPaths.markdownRelativePaths
      })
    ),
    Result.andThrough(
      (v): Result.Result<void, ValidateManifestFilesExistError> =>
        validateManifestFilesExist({
          manifestRelativePaths: v.manifest.relativePaths,
          markdownRelativePaths: v.contentPaths.markdownRelativePaths
        })
    ),
    Result.andThrough(
      (v): Result.Result<void, ValidateMarkdownFilesReferencedError> =>
        validateMarkdownFilesReferenced({
          manifestRelativePaths: v.manifest.relativePaths,
          markdownRelativePaths: v.contentPaths.markdownRelativePaths
        })
    ),
    Result.map((v): Manifest => v.manifest)
  );
}
