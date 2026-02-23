import test from 'ava';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';
import { validatePathUnderDir } from '#disk/functions/disk/validate-path-under-dir';

test('allows path within directory', t => {
  t.notThrows(() => {
    validatePathUnderDir({
      fullPath: '/repo/subdir/file.txt',
      allowedDir: '/repo'
    });
  });
});

test('allows path that is the directory itself', t => {
  t.notThrows(() => {
    validatePathUnderDir({
      fullPath: '/repo',
      allowedDir: '/repo'
    });
  });
});

test('allows nested path within directory', t => {
  t.notThrows(() => {
    validatePathUnderDir({
      fullPath: '/repo/a/b/c/file.txt',
      allowedDir: '/repo'
    });
  });
});

test('allows path with dot segments that resolves inside', t => {
  t.notThrows(() => {
    validatePathUnderDir({
      fullPath: '/repo/./subdir/./file.txt',
      allowedDir: '/repo'
    });
  });
});

test('allows path with redundant slashes that resolves inside', t => {
  t.notThrows(() => {
    validatePathUnderDir({
      fullPath: '/repo//subdir///file.txt',
      allowedDir: '/repo'
    });
  });
});

test('rejects path traversal with ../', t => {
  let error = t.throws(
    () => {
      validatePathUnderDir({
        fullPath: '/repo/../etc/passwd',
        allowedDir: '/repo'
      });
    },
    { instanceOf: ServerError }
  );
  t.is(error.message, ErEnum.DISK_PATH_TRAVERSAL);
});

test('rejects path traversal in middle segment', t => {
  let error = t.throws(
    () => {
      validatePathUnderDir({
        fullPath: '/repo/subdir/../../etc/passwd',
        allowedDir: '/repo'
      });
    },
    { instanceOf: ServerError }
  );
  t.is(error.message, ErEnum.DISK_PATH_TRAVERSAL);
});

test('rejects path with directory name prefix collision', t => {
  let error = t.throws(
    () => {
      validatePathUnderDir({
        fullPath: '/repo-part/file.txt',
        allowedDir: '/repo'
      });
    },
    { instanceOf: ServerError }
  );
  t.is(error.message, ErEnum.DISK_PATH_TRAVERSAL);
});

test('rejects absolute path outside allowed directory', t => {
  let error = t.throws(
    () => {
      validatePathUnderDir({
        fullPath: '/tmp/file.txt',
        allowedDir: '/repo'
      });
    },
    { instanceOf: ServerError }
  );
  t.is(error.message, ErEnum.DISK_PATH_TRAVERSAL);
});

test('rejects deep path traversal', t => {
  let error = t.throws(
    () => {
      validatePathUnderDir({
        fullPath: '/repo/a/b/../../../etc/shadow',
        allowedDir: '/repo'
      });
    },
    { instanceOf: ServerError }
  );
  t.is(error.message, ErEnum.DISK_PATH_TRAVERSAL);
});
