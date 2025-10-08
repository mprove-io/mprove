import { Injectable } from '@nestjs/common';
import { ProjectEnt } from '~backend/drizzle/postgres/schema/projects';
import {
  ProjectLt,
  ProjectSt,
  ProjectTab
} from '~backend/drizzle/postgres/tabs/project-tab';
import { Project } from '~common/interfaces/backend/project';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapProjectService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  tabToApi(item: {
    project: ProjectTab;
    isAddPublicKey: boolean;
    isAddGitUrl: boolean;
  }): Project {
    let { project, isAddGitUrl, isAddPublicKey } = item;

    let apiProject: Project = {
      orgId: project.orgId,
      projectId: project.projectId,
      remoteType: project.remoteType,
      name: project.st.name,
      defaultBranch: project.lt.defaultBranch,
      gitUrl: isAddGitUrl === true ? project.lt.gitUrl : undefined,
      publicKey: isAddPublicKey === true ? project.lt.publicKey : undefined,
      serverTs: Number(project.serverTs)
    };

    return apiProject;
  }

  apiToTab(project: Project): ProjectTab {
    let projectSt: ProjectSt = {
      name: project.name
    };

    let projectLt: ProjectLt = {
      defaultBranch: project.defaultBranch,
      gitUrl: project.defaultBranch,
      privateKey: project.defaultBranch,
      publicKey: project.defaultBranch
    };

    let projectTab: ProjectTab = {
      projectId: project.projectId,
      orgId: project.orgId,
      remoteType: project.remoteType,
      st: projectSt,
      lt: projectLt,
      nameHash: this.hashService.makeHash(project.name),
      gitUrlHash: this.hashService.makeHash(project.gitUrl),
      serverTs: project.serverTs
    };

    return projectTab;
  }

  entToTab(project: ProjectEnt): ProjectTab {
    let projectTab: ProjectTab = {
      ...project,
      st: this.tabService.decrypt<ProjectSt>({
        encryptedString: project.st
      }),
      lt: this.tabService.decrypt<ProjectLt>({
        encryptedString: project.lt
      })
    };

    return projectTab;
  }

  tabToEnt(project: ProjectTab): ProjectEnt {
    let projectEnt: ProjectEnt = {
      ...project,
      st: this.tabService.encrypt({ data: project.st }),
      lt: this.tabService.encrypt({ data: project.lt })
    };

    return projectEnt;
  }
}
