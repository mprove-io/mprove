import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../shared/read-text-file/read-text-file';
import type { ComposerError } from '../types/errors/composer-error';
import type { Manifest } from '../types/manifest';

export function createMarkdown(item: {
  manifest: Manifest;
  sourceDirectory: string;
}): Result.Result<string, ComposerError> {
  let { manifest, sourceDirectory } = item;

  let sections: string[] = [];

  let sectionsResult: Result.Result<string[], ComposerError> =
    Result.succeed(sections);

  for (let i = 0; i < manifest.relativePaths.length; i++) {
    let relativePath: string = manifest.relativePaths[i];

    let filePath: string = resolve(sourceDirectory, relativePath);

    let nestingLevel: number = relativePath.split('/').length - 1;

    let headingPrefix: string = '#'.repeat(nestingLevel);

    sectionsResult = Result.andThen((currentSections: string[]) =>
      Result.map((content: string) => {
        let section: string = content
          .replace(/^(?=#{1,6}(?: |$))/gmu, headingPrefix)
          .replace(/\s+$/u, '');

        currentSections.push(section);

        return currentSections;
      })(readTextFile({ filePath: filePath }))
    )(sectionsResult);
  }

  return Result.map((currentSections: string[]) =>
    currentSections.join('\n\n')
  )(sectionsResult);
}
