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

test('caps adjusted headings at H6', t => {
  let adjustedLines: string[] = ['##### Five', '###### Six'].map(line =>
    adjustMarkdownLine({ line: line, nestingLevel: 3 })
  );

  t.deepEqual(adjustedLines, ['###### Five', '###### Six']);
});

test('adjusts a heading followed by a tab and preserves its content', t => {
  let adjustedLine: string = adjustMarkdownLine({
    line: '#\tTabbed',
    nestingLevel: 1
  });

  t.is(adjustedLine, '##\tTabbed');
});

test('preserves a hash prefix without heading whitespace', t => {
  let adjustedLine: string = adjustMarkdownLine({
    line: '#Not-A-Heading',
    nestingLevel: 2
  });

  t.is(adjustedLine, '#Not-A-Heading');
});
