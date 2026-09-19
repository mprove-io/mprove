import { Result } from '@praha/byethrow';
import { readTextFile } from '../../shared/read-text-file/read-text-file';
import type { DiscoverPathsPayload } from '../../types/discover-paths-payload';
import type { DiscoverPathsError } from '../../types/function-errors/discover-paths-error';
import type { LoadManifestError } from '../../types/function-errors/load-manifest-error';
import type { ParseListedPathError } from '../../types/function-errors/parse-listed-path-error';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';
import type { ValidateDiscoveredFilesAreListedError } from '../../types/function-errors/validate-discovered-files-are-listed-error';
import type { ValidateListedPathsAreDiscoveredError } from '../../types/function-errors/validate-listed-paths-are-discovered-error';
import type { Manifest } from '../../types/manifest';
import type { ManifestLine } from '../../types/manifest-line';
import { discoverPaths } from './discover-paths/discover-paths';
import { parseListedPath } from './parse-listed-path/parse-listed-path';
import { validateDirectorySectionFilesExist } from './validate-directory-section-files-exist/validate-directory-section-files-exist';
import { validateDiscoveredFilesAreListed } from './validate-discovered-files-are-listed/validate-discovered-files-are-listed';
import { validateListedPath } from './validate-listed-path/validate-listed-path';
import { validateListedPathsAreDiscovered } from './validate-listed-paths-are-discovered/validate-listed-paths-are-discovered';
import { validateManifestPathsUnique } from './validate-manifest-paths-unique/validate-manifest-paths-unique';

type ManifestParsedLine = {
  listedPath: string;
  manifestLine: ManifestLine;
};

export function loadManifest(item: {
  contentDirectory: string;
  manifestPath: string;
}): Result.Result<Manifest, LoadManifestError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'manifestText',
      (v): Result.Result<string, ReadTextFileError> =>
        readTextFile({ filePath: v.manifestPath })
    ),
    Result.bind('manifestLines', (v): Result.Result<ManifestLine[], never> => {
      let manifestLines: ManifestLine[] = v.manifestText
        .split(/\r?\n/u)
        .map((line, index) => ({
          line: line.trim(),
          lineNumber: index + 1
        }))
        .filter(manifestLine => manifestLine.line.length > 0);

      return Result.succeed(manifestLines);
    }),
    Result.bind(
      'listedPaths',
      (v): Result.Result<string[], ParseListedPathError> =>
        Result.sequence(v.manifestLines, manifestLine =>
          parseListedPath({
            manifestLine: manifestLine,
            manifestPath: v.manifestPath
          })
        )
    ),
    Result.bind(
      'manifestParsedLines',
      (v): Result.Result<ManifestParsedLine[], never> => {
        let manifestParsedLines: ManifestParsedLine[] = v.manifestLines.map(
          (manifestLine, index) => ({
            listedPath: v.listedPaths[index],
            manifestLine: manifestLine
          })
        );

        return Result.succeed(manifestParsedLines);
      }
    ),
    Result.andThrough(v =>
      Result.sequence(v.manifestParsedLines, manifestParsedLine =>
        validateListedPath({
          listedPath: manifestParsedLine.listedPath,
          manifestLine: manifestParsedLine.manifestLine,
          manifestPath: v.manifestPath
        })
      )
    ),
    Result.andThrough(v =>
      validateManifestPathsUnique({
        listedPaths: v.listedPaths,
        manifestLines: v.manifestLines,
        manifestPath: v.manifestPath
      })
    ),
    Result.bind(
      'discoverPathsPayload',
      (v): Result.Result<DiscoverPathsPayload, DiscoverPathsError> =>
        discoverPaths({ contentDirectory: v.contentDirectory })
    ),
    Result.andThrough(v =>
      validateDirectorySectionFilesExist({
        contentDirectory: v.contentDirectory,
        discoverPathsPayload: v.discoverPathsPayload
      })
    ),
    Result.andThrough(
      (v): Result.Result<void, ValidateListedPathsAreDiscoveredError> =>
        validateListedPathsAreDiscovered({
          discoverPathsPayload: v.discoverPathsPayload,
          listedPaths: v.listedPaths
        })
    ),
    Result.andThrough(
      (v): Result.Result<void, ValidateDiscoveredFilesAreListedError> =>
        validateDiscoveredFilesAreListed({
          discoverPathsPayload: v.discoverPathsPayload,
          listedPaths: v.listedPaths
        })
    ),
    Result.map(
      (v): Manifest => ({
        listedPaths: v.listedPaths
      })
    )
  );
}
