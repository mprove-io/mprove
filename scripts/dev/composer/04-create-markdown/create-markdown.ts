import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ComposerError } from '../types/errors/composer-error';
import type { Manifest } from '../types/manifest';
import { createMarkdownSection } from './01-create-markdown-section/create-markdown-section';

export function createMarkdown(item: {
  manifest: Manifest;
  sourceDirectory: string;
}): Result.Result<string, ComposerError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'sections',
      (v): Result.Result<string[], ComposerError> =>
        Result.sequence(v.manifest.relativePaths, relativePath => {
          let filePath: string = resolve(v.sourceDirectory, relativePath);

          let nestingLevel: number = relativePath.split('/').length - 1;

          let sectionResult: Result.Result<string, ComposerError> =
            createMarkdownSection({
              filePath: filePath,
              nestingLevel: nestingLevel
            });

          return sectionResult;
        })
    ),
    Result.map((v): string => v.sections.join('\n\n'))
  );
}
