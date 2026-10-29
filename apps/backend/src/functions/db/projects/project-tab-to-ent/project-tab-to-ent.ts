import { Result } from '@praha/byethrow';
import type {
  ProjectEnt,
  ProjectTab
} from '#backend/drizzle/postgres/tables/projects';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ProjectTabToEntError } from '#common/types/backend/function-errors/project-tab-to-ent-error';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';

export function projectTabToEnt(item: {
  tab: ProjectTab;
  hashSecret?: string;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<ProjectEnt, ProjectTabToEntError> {
  let { tab } = item;

  let projectSt: ProjectSt = {
    name: tab.name,
    e2bApiKey: tab.e2bApiKey
  };

  let projectLt: ProjectLt = {
    defaultBranch: tab.defaultBranch,
    gitUrl: tab.gitUrl,
    publicKey: tab.publicKey,
    privateKey: tab.privateKey,
    publicKeyEncrypted: tab.publicKeyEncrypted,
    privateKeyEncrypted: tab.privateKeyEncrypted,
    passPhrase: tab.passPhrase
  };

  return Result.pipe(
    Result.succeed({
      ...item,
      st: projectSt,
      lt: projectLt
    }),
    Result.bind('nameHash', v =>
      makeHash({
        input: v.tab.name,
        hashSecret: v.hashSecret
      })
    ),
    Result.bind('gitUrlHash', v =>
      makeHash({
        input: v.tab.gitUrl,
        hashSecret: v.hashSecret
      })
    ),
    Result.map(
      (v): ProjectEnt => ({
        projectId: v.tab.projectId,
        orgId: v.tab.orgId,
        remoteType: v.tab.remoteType,
        nameHash: v.nameHash,
        gitUrlHash: v.gitUrlHash,
        serverTs: v.tab.serverTs,
        ...getEntProps({
          dataSt: v.st,
          dataLt: v.lt,
          isMetadata: false,
          tabService: v.tabService,
          isEncryptDb: v.isEncryptDb,
          isEncryptMetadata: v.isEncryptMetadata
        })
      })
    )
  );
}
