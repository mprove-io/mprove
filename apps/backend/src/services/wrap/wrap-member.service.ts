import { Injectable } from '@nestjs/common';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { MemberTab } from '~common/interfaces/backend/member-tab';
import { UserTab } from '~common/interfaces/backend/user-tab';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapMemberService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToApiMember(item: { member: MemberEnt }): Member {
    let { member } = item;

    let memberTab = this.tabService.decrypt<MemberTab>({
      encryptedString: member.tab
    });

    let apiMember: Member = {
      projectId: member.projectId,
      memberId: member.memberId,
      email: memberTab.email,
      alias: memberTab.alias,
      firstName: memberTab.firstName,
      lastName: memberTab.lastName,
      fullName: makeFullName({
        firstName: memberTab.firstName,
        lastName: memberTab.lastName
      }),
      avatarSmall: undefined,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: memberTab.roles,
      serverTs: member.serverTs
    };

    return apiMember;
  }

  makeMember(item: {
    projectId: string;
    roles?: string[];
    envs?: string[];
    user: UserEnt;
    isAdmin: boolean;
    isEditor: boolean;
    isExplorer: boolean;
  }): MemberEnt {
    let { projectId, roles, envs, user, isAdmin, isEditor, isExplorer } = item;

    let userTab = this.tabService.decrypt<UserTab>({
      encryptedString: user.tab
    });

    let memberTab: MemberTab = {
      email: userTab.email,
      alias: userTab.alias,
      firstName: userTab.firstName,
      lastName: userTab.lastName,
      roles: roles || []
    };

    let member: MemberEnt = {
      memberFullId: this.hashService.makeMemberFullId({
        projectId: projectId,
        memberId: user.userId
      }),
      projectId: projectId,
      memberId: user.userId,
      emailHash: this.hashService.makeHash(userTab.email),
      aliasHash: this.hashService.makeHash(userTab.alias),
      isAdmin: isAdmin,
      isEditor: isEditor,
      isExplorer: isExplorer,
      tab: this.tabService.encrypt({
        data: memberTab
      }),
      serverTs: undefined
    };

    return member;
  }
}
