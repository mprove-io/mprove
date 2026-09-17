import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { CreateMarkdownError } from '../types/function-errors/create-markdown-error';
import type { CreateMarkdownSectionError } from '../types/function-errors/create-markdown-section-error';
import type { Manifest } from '../types/manifest';
import { createMarkdownSection } from './01-create-markdown-section/create-markdown-section';

export function createMarkdown(item: {
  manifest: Manifest;
  sourceDirectory: string;
}): Result.Result<string, CreateMarkdownError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'sections',
      (v): Result.Result<string[], CreateMarkdownSectionError> =>
        Result.sequence(v.manifest.relativePaths, relativePath => {
          let filePath: string = resolve(v.sourceDirectory, relativePath);

          let nestingLevel: number = relativePath.split('/').length - 1;

          let sectionResult: Result.Result<string, CreateMarkdownSectionError> =
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
