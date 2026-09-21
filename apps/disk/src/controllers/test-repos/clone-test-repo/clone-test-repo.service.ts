import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ensureDir, remove } from 'fs-extra';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskCloneTestRepoOutput } from '#common/zod/disk/routes/test-repos/clone-test-repo/clone-test-repo-response';
import type { DiskConfig } from '#disk/config/disk-config';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

@Injectable()
export class CloneTestRepoService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    testId: string;
  }): Promise<ToDiskResponseResultForOperation<'cloneTestRepo'>> {
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
        repoPath: repoPath,
        gitUrl: gitUrl
      }),
      Result.andThrough(async v => {
        await ensureDir(v.testReposPath);
        return Result.succeed();
      }),
      Result.andThrough(async v => {
        await remove(v.repoPath);
        return Result.succeed();
      }),
      Result.andThrough(async v => {
        await createSimpleGit({}).clone(v.gitUrl, v.repoPath);
        return Result.succeed();
      }),
      Result.map((v): ToDiskCloneTestRepoOutput => ({}))
    );

    return cloneTestRepoResult;
  }
}
