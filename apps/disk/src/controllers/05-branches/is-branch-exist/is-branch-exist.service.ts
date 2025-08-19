import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '~common/enums/er.enum';
import {
  ToDiskIsBranchExistRequest,
  ToDiskIsBranchExistResponsePayload
} from '~common/interfaces/to-disk/05-branches/to-disk-is-branch-exist';
import { ServerError } from '~common/models/server-error';
import { ensureDir } from '~disk/functions/disk/ensure-dir';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '~disk/functions/git/is-remote-branch-exist';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { Config } from '~disk/interfaces/config';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class IsBranchExistService {
  constructor(
    private cs: ConfigService<Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskIsBranchExistRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<Config['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      projectId,
      repoId,
      branch,
      isRemote,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    //

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    let isBranchExist =
      isRemote === true
        ? await isRemoteBranchExist({
            repoDir: repoDir,
            remoteBranch: branch,
            fetchOptions: fetchOptions
          })
        : await isLocalBranchExist({
            repoDir: repoDir,
            localBranch: branch
          });

    let payload: ToDiskIsBranchExistResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      repoId: repoId,
      branch: branch,
      isRemote: isRemote,
      isBranchExist: isBranchExist
    };

    return payload;
  }
}
