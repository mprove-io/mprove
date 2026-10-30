import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import type { TabService } from '#backend/services/tab/tab.service';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';

export function projectTabToBaseProject(item: {
  project: ProjectTab;
  tabService: TabService;
}): BaseProject {
  let { project, tabService } = item;

  let projectSt: ProjectSt = {
    name: project.name,
    e2bApiKey: undefined // baseProject does not need project.e2bApiKey
  };

  let projectLt: ProjectLt = {
    defaultBranch: project.defaultBranch,
    gitUrl: project.gitUrl,
    publicKey: project.publicKey,
    privateKey: project.privateKey,
    publicKeyEncrypted: project.publicKey,
    privateKeyEncrypted: project.privateKeyEncrypted,
    passPhrase: project.passPhrase
  };

  let baseProject: BaseProject = {
    orgId: project.orgId,
    projectId: project.projectId,
    remoteType: project.remoteType,
    st: tabService.encrypt({ data: projectSt }),
    lt: tabService.encrypt({ data: projectLt })
  };

  return baseProject;
}
