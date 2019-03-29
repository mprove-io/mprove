import { MemberEntity } from '../models/store/entities/_index';

export interface ProjectIdToMembersMap {
  [projectId: string]: MemberEntity[];
}
