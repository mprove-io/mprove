import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ensureDir, remove } from 'fs-extra';
import type { ToDiskCloneTestRepoOutput } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-response';
import type { ToDiskResultForOperation } from '#common/zod/to-disk/to-disk-result-for-operation';
import type { DiskConfig } from '#disk/config/disk-config';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

@Injectable()
export class CloneTestRepoService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    testId: string;
  }): Promise<ToDiskResultForOperation<'cloneTestRepo'>> {
    let { testId } = item;

    let testReposPath: string =
      this.cs.get<DiskConfig['diskTestReposPath']>('diskTestReposPath');

    let gitUrl: string = this.cs.get<DiskConfig['diskTestLocalSourceGitUrl']>(
      'diskTestLocalSourceGitUrl'
    );

    let repoPath: string = `${testReposPath}/${testId}`;

    let cloneTestRepoResult = Result.pipe(
      Result.succeed({
        testReposPath: testReposPath,
        repoPath: repoPath
      }),
      Result.andThrough(async item => {
        await ensureDir(item.testReposPath);
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await remove(item.repoPath);
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await createSimpleGit({}).clone(gitUrl, item.repoPath);
        return Result.succeed();
      }),
      Result.map((): ToDiskCloneTestRepoOutput => ({}))
    );

    return cloneTestRepoResult;
  }
}
