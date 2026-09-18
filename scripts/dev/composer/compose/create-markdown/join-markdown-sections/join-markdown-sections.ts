import { Result } from '@praha/byethrow';
import type { MarkdownSection } from '../../../types/markdown-section';

export function joinMarkdownSections(item: {
  sections: MarkdownSection[];
}): Result.Result<string, never> {
  let { sections } = item;

  let sectionContents: string[] = sections.map(section => {
    let content: string = section.lines.join('\n');

    let sectionContent: string = content.replace(/\s+$/u, '');

    return sectionContent;
  });

  let markdown: string = sectionContents.join('\n\n');

  return Result.succeed(markdown);
}
