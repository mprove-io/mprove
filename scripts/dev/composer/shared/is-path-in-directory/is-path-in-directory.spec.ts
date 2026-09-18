import { resolve } from 'node:path';
import test from 'ava';
import { isPathInDirectory } from './is-path-in-directory';

test('returns true for the directory itself', t => {
  let directoryPath: string = resolve('workspace', 'content');

  let isInDirectory: boolean = isPathInDirectory({
    directoryPath: directoryPath,
    path: directoryPath
  });

  t.true(isInDirectory);
});

test('returns true for a direct child', t => {
  let directoryPath: string = resolve('workspace', 'content');

  let path: string = resolve(directoryPath, 'intro.md');

  let isInDirectory: boolean = isPathInDirectory({
    directoryPath: directoryPath,
    path: path
  });

  t.true(isInDirectory);
});

test('returns true for a deeply nested child', t => {
  let directoryPath: string = resolve('workspace', 'content');

  let path: string = resolve(directoryPath, 'rules', 'nested', 'rule.md');

  let isInDirectory: boolean = isPathInDirectory({
    directoryPath: directoryPath,
    path: path
  });

  t.true(isInDirectory);
});

test('returns false for the parent directory', t => {
  let directoryPath: string = resolve('workspace', 'content');

  let path: string = resolve(directoryPath, '..');

  let isInDirectory: boolean = isPathInDirectory({
    directoryPath: directoryPath,
    path: path
  });

  t.false(isInDirectory);
});

test('returns false for a sibling directory', t => {
  let directoryPath: string = resolve('workspace', 'content');

  let path: string = resolve(directoryPath, '..', 'other');

  let isInDirectory: boolean = isPathInDirectory({
    directoryPath: directoryPath,
    path: path
  });

  t.false(isInDirectory);
});

test('returns false for a similarly prefixed sibling directory', t => {
  let directoryPath: string = resolve('workspace', 'content');

  let path: string = resolve(directoryPath, '..', 'content-copy', 'rule.md');

  let isInDirectory: boolean = isPathInDirectory({
    directoryPath: directoryPath,
    path: path
  });

  t.false(isInDirectory);
});

test('returns false when normalized traversal escapes the directory', t => {
  let directoryPath: string = resolve('workspace', 'content');

  let path: string = resolve(directoryPath, 'rules', '..', '..', 'outside.md');

  let isInDirectory: boolean = isPathInDirectory({
    directoryPath: directoryPath,
    path: path
  });

  t.false(isInDirectory);
});
