import { Injectable } from '@nestjs/common';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import {
  MemberLt,
  MemberSt,
  MemberTab
} from '~backend/drizzle/postgres/tabs/member-tab';
import { UserTab } from '~backend/drizzle/postgres/tabs/user-tab';
import { makeFullName } from '~backend/functions/make-full-name';
import { Member } from '~common/interfaces/backend/member';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapMemberService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  makeMemberEnt(item: {
    projectId: string;
    roles?: string[];
    user: UserTab;
    isAdmin: boolean;
    isEditor: boolean;
    isExplorer: boolean;
  }): MemberEnt {
    let { projectId, roles, user, isAdmin, isEditor, isExplorer } = item;

    let memberSt: MemberSt = {
      email: user.lt.email,
      alias: user.lt.alias,
      firstName: user.lt.firstName,
      lastName: user.lt.lastName,
      roles: roles || []
    };

    let memberLt: MemberLt = {};

    let memberEnt: MemberEnt = {
      memberFullId: this.hashService.makeMemberFullId({
        projectId: projectId,
        memberId: user.userId
      }),
      projectId: projectId,
      memberId: user.userId,
      isAdmin: isAdmin,
      isEditor: isEditor,
      isExplorer: isExplorer,
      st: this.tabService.encrypt({ data: memberSt }),
      lt: this.tabService.encrypt({ data: memberLt }),
      emailHash: this.hashService.makeHash(user.lt.email),
      aliasHash: this.hashService.makeHash(user.lt.alias),
      serverTs: undefined
    };

    return memberEnt;
  }

  tabToApi(item: { member: MemberTab }): Member {
    let { member } = item;

    let apiMember: Member = {
      projectId: member.projectId,
      memberId: member.memberId,
      email: member.st.email,
      alias: member.st.alias,
      firstName: member.st.firstName,
      lastName: member.st.lastName,
      fullName: makeFullName({
        firstName: member.st.firstName,
        lastName: member.st.lastName
      }),
      avatarSmall: undefined,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: member.st.roles,
      serverTs: member.serverTs
    };

    return apiMember;
  }

  tabToEnt(member: MemberTab): MemberEnt {
    let memberEnt: MemberEnt = {
      ...member,
      st: this.tabService.encrypt({ data: member.st }),
      lt: this.tabService.encrypt({ data: member.lt })
    };

    return memberEnt;
  }

  entToTab(member: MemberEnt): MemberTab {
    let memberTab: MemberTab = {
      ...member,
      st: this.tabService.decrypt<MemberSt>({
        encryptedString: member.st
      }),
      lt: this.tabService.decrypt<MemberLt>({
        encryptedString: member.lt
      })
    };

    return memberTab;
  }
}
