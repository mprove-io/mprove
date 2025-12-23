import * as nodegit from 'nodegit';
import { CENTRAL_REPO_ID } from '~common/constants/top-disk';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { addTraceSpan } from '~node-common/functions/add-trace-span';

export async function cloneRemote(item: {
  orgId: string;
  projectId: string;
  repoId: string;
  orgPath: string;
  remoteType: ProjectRemoteTypeEnum;
  gitUrl: string;
  cloneOptions: nodegit.CloneOptions;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.cloneRemote',
    fn: async () => {
      let { orgId, projectId, repoId, orgPath, remoteType, gitUrl } = item;

      let projectDir = `${orgPath}/${orgId}/${projectId}`;

      let remoteUrl =
        remoteType === ProjectRemoteTypeEnum.GitClone
          ? gitUrl
          : `${projectDir}/${CENTRAL_REPO_ID}`;

      let dirDev = `${projectDir}/${repoId}`;

      await nodegit.Clone(remoteUrl, dirDev, item.cloneOptions);
    }
  });
}
