import { Result } from '@praha/byethrow';

export function joinMarkdownSections(item: {
  contentLines: string[][];
}): Result.Result<string, never> {
  let { contentLines } = item;

  let sections: string[] = contentLines.map(lines => {
    let content: string = lines.join('\n');

    let section: string = content.replace(/\s+$/u, '');

    return section;
  });

  let markdown: string = sections.join('\n\n');

  return Result.succeed(markdown);
}
