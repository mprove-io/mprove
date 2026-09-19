import test from 'ava';
import { adjustMarkdownLine } from './adjust-markdown-line';

test('adjusts only ATX headings that start at the beginning of a line', t => {
  let lines: string[] = [
    '# Top',
    '',
    ' # Indented heading',
    'Nested title',
    '------------'
  ];

  let adjustedLines: string[] = lines.map(line =>
    adjustMarkdownLine({ line: line, nestingLevel: 1 })
  );

  t.deepEqual(adjustedLines, [
    '## Top',
    '',
    ' # Indented heading',
    'Nested title',
    '------------'
  ]);
});

test('preserves Setext headings at nested levels', t => {
  let lines: string[] = ['Root title', '=========='];

  let adjustedLines: string[] = lines.map(line =>
    adjustMarkdownLine({ line: line, nestingLevel: 2 })
  );

  t.deepEqual(adjustedLines, lines);
});
