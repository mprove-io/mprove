import { Result } from '@praha/byethrow';
import test from 'ava';
import { joinMarkdownSections } from './join-markdown-sections';

test('joins sections with one blank line and trims trailing whitespace', t => {
  let result: Result.Result<string, never> = joinMarkdownSections({
    sections: [
      { lines: ['# First', 'Body', '', ''] },
      { lines: ['# Second', 'Body   ', ''] }
    ]
  });

  t.deepEqual(result, {
    type: 'Success',
    value: '# First\nBody\n\n# Second\nBody'
  });
});

test('returns empty Markdown for no sections', t => {
  let result: Result.Result<string, never> = joinMarkdownSections({
    sections: []
  });

  t.deepEqual(result, { type: 'Success', value: '' });
});
