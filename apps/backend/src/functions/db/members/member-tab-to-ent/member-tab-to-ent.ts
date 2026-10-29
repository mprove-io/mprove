import { Result } from '@praha/byethrow';
import type {
  MemberEnt,
  MemberTab
} from '#backend/drizzle/postgres/tables/members';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { makeMemberFullId } from '#backend/functions/hash/make-member-full-id/make-member-full-id';
import type { TabService } from '#backend/services/tab/tab.service';
import type { MemberTabToEntError } from '#common/types/backend/function-errors/member-tab-to-ent-error';
import type { MemberLt } from '#common/types/shared/st-lt/members/member-lt';
import type { MemberSt } from '#common/types/shared/st-lt/members/member-st';

export function memberTabToEnt(item: {
  tab: MemberTab;
  hashSecret?: string;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<MemberEnt, MemberTabToEntError> {
  let { tab } = item;

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
      memberFullId: makeMemberFullId({
        projectId: tab.projectId,
        memberId: tab.memberId
      }),
      st: memberSt,
      lt: memberLt
    }),
    Result.bind('emailHash', v =>
      makeHash({
        input: v.tab.email,
        hashSecret: v.hashSecret
      })
    ),
    Result.bind('aliasHash', v =>
      makeHash({
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
