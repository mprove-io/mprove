import test from 'ava';
import { adjustMarkdownHeadings } from './adjust-markdown-headings';

test('adjusts ATX and Setext headings while preserving fenced content', t => {
  let content: string = [
    '# Top',
    '',
    '```md',
    '# Code heading',
    '```',
    '',
    'Nested title',
    '------------'
  ].join('\n');

  let adjustedContent: string = adjustMarkdownHeadings({
    content: content,
    nestingLevel: 1
  });

  let expectedContent: string = [
    '## Top',
    '',
    '```md',
    '# Code heading',
    '```',
    '',
    '### Nested title'
  ].join('\n');

  t.is(adjustedContent, expectedContent);
});

test('preserves Setext headings at the root nesting level', t => {
  let content: string = ['Root title', '=========='].join('\n');

  let adjustedContent: string = adjustMarkdownHeadings({
    content: content,
    nestingLevel: 0
  });

  t.is(adjustedContent, content);
});
