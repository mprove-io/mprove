import { type SimpleGit, simpleGit } from 'simple-git';

export function createSimpleGit(item: { baseDir?: string }): SimpleGit {
  let { baseDir } = item;

  return simpleGit({
    ...(baseDir ? { baseDir: baseDir } : {}),
    config: ['core.symlinks=false']
  });
}
