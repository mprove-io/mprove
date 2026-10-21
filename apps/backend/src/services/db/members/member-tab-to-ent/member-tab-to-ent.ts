import { Result } from '@praha/byethrow';
import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { MemberTabToEntError } from '#common/types/backend/function-errors/member-tab-to-ent-error';
import type { MemberLt } from '#common/types/shared/st-lt/members/member-lt';
import type { MemberSt } from '#common/types/shared/st-lt/members/member-st';

export function memberTabToEnt(item: {
  tab: MemberTab;
  hashSecret?: string;
  hashService: HashService;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<MemberEnt, MemberTabToEntError> {
  let { tab, hashService } = item;

  let memberSt: MemberSt = {
    email: tab.email,
    alias: tab.alias,
    firstName: tab.firstName,
    lastName: tab.lastName,
    roles: tab.roles
  };

  let memberLt: MemberLt = {};

  return Result.pipe(
    Result.succeed({
      ...item,
      memberFullId: hashService.makeMemberFullId({
        projectId: tab.projectId,
        memberId: tab.memberId
      }),
      st: memberSt,
      lt: memberLt
    }),
    Result.bind('emailHash', v =>
      v.hashService.makeHash({
        input: v.tab.email,
        hashSecret: v.hashSecret
      })
    ),
    Result.bind('aliasHash', v =>
      v.hashService.makeHash({
        input: v.tab.alias,
        hashSecret: v.hashSecret
      })
    ),
    Result.map(
      (v): MemberEnt => ({
        memberFullId: v.memberFullId,
        projectId: v.tab.projectId,
        memberId: v.tab.memberId,
        isAdmin: v.tab.isAdmin,
        isEditor: v.tab.isEditor,
        isExplorer: v.tab.isExplorer,
        emailHash: v.emailHash,
        aliasHash: v.aliasHash,
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
