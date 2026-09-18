import { Result } from '@praha/byethrow';
import test from 'ava';
import { adjustMarkdownHeadings } from './adjust-markdown-headings';

test('adjusts ATX headings while preserving fenced and Setext content', t => {
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

  let result: Result.Result<string, never> = adjustMarkdownHeadings({
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
    'Nested title',
    '------------'
  ].join('\n');

  t.deepEqual(result, {
    type: 'Success',
    value: expectedContent
  });
});

test('preserves Setext headings at nested levels', t => {
  let content: string = ['Root title', '=========='].join('\n');

  let result: Result.Result<string, never> = adjustMarkdownHeadings({
    content: content,
    nestingLevel: 2
  });

  t.deepEqual(result, {
    type: 'Success',
    value: content
  });
});
