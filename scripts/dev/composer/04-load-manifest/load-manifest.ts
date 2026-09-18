import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../shared/read-text-file/read-text-file';
import type { GetMarkdownFilePathsError } from '../types/function-errors/get-markdown-file-paths-error';
import type { LoadManifestError } from '../types/function-errors/load-manifest-error';
import type { ParseManifestError } from '../types/function-errors/parse-manifest-error';
import type { ReadTextFileError } from '../types/function-errors/read-text-file-error';
import type { ValidateManifestPathsError } from '../types/function-errors/validate-manifest-paths-error';
import type { ValidateMarkdownTitlesError } from '../types/function-errors/validate-markdown-titles-error';
import type { Manifest } from '../types/manifest';
import { parseManifest } from './002-parse-manifest/parse-manifest';
import { getMarkdownFilePaths } from './003-get-markdown-file-paths/get-markdown-file-paths';
import { validateManifestPaths } from './004-validate-manifest-paths/validate-manifest-paths';
import { validateMarkdownTitles } from './005-validate-markdown-titles/validate-markdown-titles';

export function loadManifest(item: {
  ignoredRelativePaths: string[];
  manifestPath: string;
  sourceDirectory: string;
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
      'markdownPaths',
      (v): Result.Result<string[], GetMarkdownFilePathsError> =>
        getMarkdownFilePaths({ sourceDirectory: v.sourceDirectory })
    ),
    Result.andThrough(
      (v): Result.Result<void, ValidateManifestPathsError> =>
        validateManifestPaths({
          ignoredRelativePaths: v.ignoredRelativePaths,
          manifestRelativePaths: v.manifest.relativePaths,
          markdownPaths: v.markdownPaths
        })
    ),
    Result.bind(
      'markdownContents',
      (v): Result.Result<string[], ReadTextFileError> =>
        Result.sequence(v.manifest.relativePaths, relativePath => {
          let filePath: string = resolve(v.sourceDirectory, relativePath);

          return readTextFile({ filePath: filePath });
        })
    ),
    Result.andThrough(
      (v): Result.Result<void, ValidateMarkdownTitlesError> =>
        validateMarkdownTitles({
          contents: v.markdownContents,
          relativePaths: v.manifest.relativePaths,
          sourceDirectory: v.sourceDirectory
        })
    ),
    Result.map((v): Manifest => v.manifest)
  );
}
