import { Result } from '@praha/byethrow';
import type { ComposeError } from '../types/function-errors/compose-error';
import { createMarkdown } from './create-markdown/create-markdown';
import { loadManifest } from './load-manifest/load-manifest';
import { validateInput } from './validate-input/validate-input';
import { writeOutput } from './write-output/write-output';

export function compose(item: {
  argv: string[];
}): Result.Result<void, ComposeError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThen(v => validateInput({ argv: v.argv })),
    Result.bind('manifest', v =>
      loadManifest({
        contentDirectory: v.contentDirectory,
        manifestPath: v.manifestPath
      })
    ),
    Result.bind('markdown', v =>
      createMarkdown({
        contentDirectory: v.contentDirectory,
        listedPaths: v.manifest.listedPaths
      })
    ),
    Result.andThrough(v =>
      writeOutput({ markdown: v.markdown, outputPath: v.outputPath })
    ),
    Result.map((v): void => {
      console.log(`Wrote ${v.outputPath}`);
    })
  );
}
