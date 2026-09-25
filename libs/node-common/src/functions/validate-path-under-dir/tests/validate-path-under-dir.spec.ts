import { Result } from '@praha/byethrow';
import test from 'ava';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir/validate-path-under-dir';

test('allows path within directory', t => {
  let resolvedPath: string = Result.unwrap(
    validatePathUnderDir({
      fullPath: '/repo/subdir/file.txt',
      allowedDir: '/repo'
    })
  );

  t.is(resolvedPath, '/repo/subdir/file.txt');
});

test('allows path that is the directory itself', t => {
  let resolvedPath: string = Result.unwrap(
    validatePathUnderDir({
      fullPath: '/repo',
      allowedDir: '/repo'
    })
  );

  t.is(resolvedPath, '/repo');
});

test('allows nested path within directory', t => {
  let resolvedPath: string = Result.unwrap(
    validatePathUnderDir({
      fullPath: '/repo/a/b/c/file.txt',
      allowedDir: '/repo'
    })
  );

  t.is(resolvedPath, '/repo/a/b/c/file.txt');
});

test('allows path with dot segments that resolves inside', t => {
  let resolvedPath: string = Result.unwrap(
    validatePathUnderDir({
      fullPath: '/repo/./subdir/./file.txt',
      allowedDir: '/repo'
    })
  );

  t.is(resolvedPath, '/repo/subdir/file.txt');
});

test('allows path with redundant slashes that resolves inside', t => {
  let resolvedPath: string = Result.unwrap(
    validatePathUnderDir({
      fullPath: '/repo//subdir///file.txt',
      allowedDir: '/repo'
    })
  );

  t.is(resolvedPath, '/repo/subdir/file.txt');
});

test('rejects path traversal with ../', t => {
  let error = Result.unwrapError(
    validatePathUnderDir({
      fullPath: '/repo/../etc/passwd',
      allowedDir: '/repo'
    })
  );

  t.is(error.code, 'DISK_PATH_TRAVERSAL');
});

test('rejects path traversal in middle segment', t => {
  let error = Result.unwrapError(
    validatePathUnderDir({
      fullPath: '/repo/subdir/../../etc/passwd',
      allowedDir: '/repo'
    })
  );

  t.is(error.code, 'DISK_PATH_TRAVERSAL');
});

test('rejects path with directory name prefix collision', t => {
  let error = Result.unwrapError(
    validatePathUnderDir({
      fullPath: '/repo-part/file.txt',
      allowedDir: '/repo'
    })
  );

  t.is(error.code, 'DISK_PATH_TRAVERSAL');
});

test('rejects absolute path outside allowed directory', t => {
  let error = Result.unwrapError(
    validatePathUnderDir({
      fullPath: '/tmp/file.txt',
      allowedDir: '/repo'
    })
  );

  t.is(error.code, 'DISK_PATH_TRAVERSAL');
});

test('rejects deep path traversal', t => {
  let error = Result.unwrapError(
    validatePathUnderDir({
      fullPath: '/repo/a/b/../../../etc/shadow',
      allowedDir: '/repo'
    })
  );

  t.is(error.code, 'DISK_PATH_TRAVERSAL');
});
