import { Result } from '@praha/byethrow';
import type { ProjectTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ProjectTabToEntError } from '#common/types/backend/function-errors/project-tab-to-ent-error';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';

export function projectTabToEnt(item: {
  tab: ProjectTab;
  hashSecret?: string;
  hashService: HashService;
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
      v.hashService.makeHash({
        input: v.tab.name,
        hashSecret: v.hashSecret
      })
    ),
    Result.bind('gitUrlHash', v =>
      v.hashService.makeHash({
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
