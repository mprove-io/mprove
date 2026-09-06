import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ensureDir, remove } from 'fs-extra';
import { ErEnum } from '#common/enums/er.enum';
import { zToDiskCloneTestRepoRequest } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-request';
import type { ToDiskCloneTestRepoRequestPayload } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-request-payload';
import type { ToDiskCloneTestRepoResponsePayload } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { createSimpleGit } from '#node-common/functions/create-simple-git';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class CloneTestRepoService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskCloneTestRepoResponsePayload> {
    let requestValid = zodParseOrThrow({
      schema: zToDiskCloneTestRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { testId }: ToDiskCloneTestRepoRequestPayload = requestValid.payload;

    let testReposPath =
      this.cs.get<DiskConfig['diskTestReposPath']>('diskTestReposPath');

    let gitUrl = this.cs.get<DiskConfig['diskTestLocalSourceGitUrl']>(
      'diskTestLocalSourceGitUrl'
    );

    let repoPath = `${testReposPath}/${testId}`;

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
      Result.map((): ToDiskCloneTestRepoResponsePayload => ({})),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(cloneTestRepoResult);

    return payload;
  }
}
