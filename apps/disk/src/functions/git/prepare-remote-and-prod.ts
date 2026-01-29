import nodegit from 'nodegit';

import { BRANCH_MAIN, PROD_REPO_ID } from '#common/constants/top';
import { CENTRAL_REPO_ID } from '#common/constants/top-disk';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { ensureDir } from '../disk/ensure-dir';
import { createInitialCommitToProd } from './create-initial-commit-to-prod';
import { pushToRemote } from './push-to-remote';

export async function prepareRemoteAndProd(item: {
  projectId: string;
  projectDir: string;
  testProjectId: string;
  projectName: string;
  userAlias: string;
  remoteType: ProjectRemoteTypeEnum;
  gitUrl: string;
  cloneOptions: nodegit.CloneOptions;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.prepareRemoteAndProd',
    fn: async () => {
      let prodDir = `${item.projectDir}/${PROD_REPO_ID}`;
      let centralDir = `${item.projectDir}/${CENTRAL_REPO_ID}`;
      await ensureDir(prodDir);

      if (item.remoteType === ProjectRemoteTypeEnum.Managed) {
        await ensureDir(centralDir);

        // init central repo
        let isBare = 1;
        let repo = await nodegit.Repository.init(centralDir, isBare);
        await repo.setHead(`refs/heads/${BRANCH_MAIN}`);
      }

      let remoteUrl =
        item.remoteType === ProjectRemoteTypeEnum.GitClone
          ? item.gitUrl
          : centralDir;

      await nodegit.Clone(remoteUrl, prodDir, item.cloneOptions);

      if (item.remoteType === ProjectRemoteTypeEnum.Managed) {
        await createInitialCommitToProd({
          prodDir: prodDir,
          testProjectId: item.testProjectId,
          projectId: item.projectId,
          userAlias: item.userAlias,
          projectName: item.projectName
        });

        await pushToRemote({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: prodDir,
          branch: BRANCH_MAIN,
          fetchOptions: item.cloneOptions.fetchOpts
        });
      }
    }
  });
}
