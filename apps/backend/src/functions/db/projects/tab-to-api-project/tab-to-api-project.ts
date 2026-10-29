import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { Project } from '#common/types/backend/parts/project/project';

export function tabToApiProject(item: {
  project: ProjectTab;
  isAddPublicKey: boolean;
  isAddGitUrl: boolean;
}): Project {
  let { project, isAddGitUrl, isAddPublicKey } = item;

  let apiProject: Project = {
    orgId: project.orgId,
    projectId: project.projectId,
    remoteType: project.remoteType,
    name: project.name,
    defaultBranch: project.defaultBranch,
    gitUrl: isAddGitUrl === true ? project.gitUrl : undefined,
    publicKey: isAddPublicKey === true ? project.publicKey : undefined,
    isE2bApiKeySet: isDefinedAndNotEmpty(project.e2bApiKey),
    serverTs: Number(project.serverTs)
  };

  return apiProject;
}
