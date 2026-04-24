import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ensureDir, remove } from 'fs-extra';
import { ErEnum } from '#common/enums/er.enum';
import { zToDiskCloneTestRepoRequest } from '#common/zod/to-disk/10-test/to-disk-clone-test-repo';
import { DiskConfig } from '#disk/config/disk-config';
import { createSimpleGit } from '#node-common/functions/create-simple-git';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class CloneTestRepoService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let requestValid = zodParseOrThrow({
      schema: zToDiskCloneTestRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { testId } = requestValid.payload;

    let testReposPath =
      this.cs.get<DiskConfig['diskTestReposPath']>('diskTestReposPath');

    let gitUrl = this.cs.get<DiskConfig['diskTestLocalSourceGitUrl']>(
      'diskTestLocalSourceGitUrl'
    );

    let repoPath = `${testReposPath}/${testId}`;

    await ensureDir(testReposPath);
    await remove(repoPath);

    await createSimpleGit({}).clone(gitUrl, repoPath);

    return {};
  }
}
