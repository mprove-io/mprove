import { simpleGit } from 'simple-git';

import { BRANCH_MAIN, PROD_REPO_ID } from '#common/constants/top';
import { CENTRAL_REPO_ID } from '#common/constants/top-disk';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { createGitInstance } from '#disk/functions/make-fetch-options';
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
  keyDir: string;
  privateKeyEncrypted: string;
  publicKey: string;
  passPhrase: string;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.prepareRemoteAndProd',
    fn: async () => {
      let prodDir = `${item.projectDir}/${PROD_REPO_ID}`;
      let centralDir = `${item.projectDir}/${CENTRAL_REPO_ID}`;
      await ensureDir(prodDir);

      if (item.remoteType === ProjectRemoteTypeEnum.Managed) {
        await ensureDir(centralDir);

        // init central repo as bare
        let centralGit = simpleGit(centralDir);
        await centralGit.init(true);
        await centralGit.raw([
          'symbolic-ref',
          'HEAD',
          `refs/heads/${BRANCH_MAIN}`
        ]);
      }

      let remoteUrl =
        item.remoteType === ProjectRemoteTypeEnum.GitClone
          ? item.gitUrl
          : centralDir;

      let git = await createGitInstance({
        repoDir: undefined,
        remoteType: item.remoteType,
        keyDir: item.keyDir,
        gitUrl: item.gitUrl,
        privateKeyEncrypted: item.privateKeyEncrypted,
        publicKey: item.publicKey,
        passPhrase: item.passPhrase
      });

      await git.clone(remoteUrl, prodDir);

      if (item.remoteType === ProjectRemoteTypeEnum.Managed) {
        await createInitialCommitToProd({
          prodDir: prodDir,
          testProjectId: item.testProjectId,
          projectId: item.projectId,
          userAlias: item.userAlias,
          projectName: item.projectName
        });

        let prodGit = simpleGit({ baseDir: prodDir });

        await pushToRemote({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: prodDir,
          branch: BRANCH_MAIN,
          git: prodGit
        });
      }
    }
  });
}
