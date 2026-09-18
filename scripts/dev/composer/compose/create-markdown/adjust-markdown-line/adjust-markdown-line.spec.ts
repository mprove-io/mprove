import test from 'ava';
import {
  adjustMarkdownLine,
  type MarkdownAdjustmentState
} from './adjust-markdown-line';

test('adjusts ATX headings while preserving fenced and Setext content', t => {
  let lines: string[] = [
    '# Top',
    '',
    '```md',
    '# Code heading',
    '```',
    '',
    'Nested title',
    '------------'
  ];

  let state: MarkdownAdjustmentState = {
    openFenceCharacter: '',
    openFenceLength: 0
  };

  let adjustedLines: string[] = lines.map(line =>
    adjustMarkdownLine({ line: line, nestingLevel: 1, state: state })
  );

  t.deepEqual(adjustedLines, [
    '## Top',
    '',
    '```md',
    '# Code heading',
    '```',
    '',
    'Nested title',
    '------------'
  ]);
});

test('preserves Setext headings at nested levels', t => {
  let lines: string[] = ['Root title', '=========='];

  let state: MarkdownAdjustmentState = {
    openFenceCharacter: '',
    openFenceLength: 0
  };

  let adjustedLines: string[] = lines.map(line =>
    adjustMarkdownLine({ line: line, nestingLevel: 2, state: state })
  );

  t.deepEqual(adjustedLines, lines);
});
