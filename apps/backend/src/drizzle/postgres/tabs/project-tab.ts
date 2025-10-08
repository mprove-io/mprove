import { ProjectEnt } from '../schema/projects';

export interface ProjectTab
  extends Omit<ProjectEnt, 'st' | 'lt'>,
    ProjectSt,
    ProjectLt {}

export class ProjectSt {
  name: string;
}

export class ProjectLt {
  gitUrl: string;
  defaultBranch: string;
  privateKey: string;
  publicKey: string;
}
