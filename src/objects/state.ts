import { User } from './user';
import { Project } from './project';
import { Subscription } from './subscription';
import { Payment } from './payment';
import { Member } from './member';
import { CatalogFile } from './catalog-file';
import { Struct } from './struct';

export interface State {
  user: User;
  projects: Project[];
  subscriptions: Subscription[];
  payments: Payment[];
  members: Member[];
  files: CatalogFile[];
  structs: Struct[];
}
