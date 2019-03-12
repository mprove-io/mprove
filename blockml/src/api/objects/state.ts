import { User } from './user';
import { Project } from './project';
import { Member } from './member';
import { CatalogFile } from './catalog-file';
import { Struct } from './struct';

export interface State {
  user: User;
  projects: Project[];
  members: Member[];
  files: CatalogFile[];
  structs: Struct[];
}
