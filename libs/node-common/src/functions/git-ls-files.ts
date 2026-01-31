import { simpleGit } from 'simple-git';

export async function gitLsFiles(dir: string): Promise<string[]> {
  let git = simpleGit({ baseDir: dir });
  let result = await git.raw(['ls-files']);
  let paths = result.split('\n').filter(p => p.length !== 0);
  return paths;
}
