import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ensureDir, remove } from 'fs-extra';
import { simpleGit } from 'simple-git';
import { ErEnum } from '#common/enums/er.enum';
import { ToDiskCloneTestRepoRequest } from '#common/interfaces/to-disk/10-test/to-disk-clone-test-repo';
import { DiskConfig } from '#disk/config/disk-config';
import { transformValidSync } from '#node-common/functions/transform-valid-sync';

@Injectable()
export class CloneTestRepoService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let requestValid = transformValidSync({
      classType: ToDiskCloneTestRepoRequest,
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

    await simpleGit().clone(gitUrl, repoPath);

    return {};
  }
}
