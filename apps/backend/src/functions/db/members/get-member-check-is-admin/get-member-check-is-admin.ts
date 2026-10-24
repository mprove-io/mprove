import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type MemberEnt,
  membersTable
} from '#backend/drizzle/postgres/schema/members';
import type { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetMemberCheckIsAdminError } from '#common/types/backend/function-errors/get-member-check-is-admin-error';

export async function getMemberCheckIsAdmin(item: {
  memberId: string;
  projectId: string;
  db: DbService;
}): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('memberEnt', v =>
      v.db.drizzle.query.membersTable
        .findFirst({
          where: and(
            eq(membersTable.memberId, v.memberId),
            eq(membersTable.projectId, v.projectId)
          )
        })
        .then((memberEnt: MemberEnt) =>
          isUndefined(memberEnt)
            ? Result.fail({ code: 'BACKEND_MEMBER_DOES_NOT_EXIST' })
            : Result.succeed(memberEnt)
        )
    ),
    Result.andThrough(v =>
      v.memberEnt.isAdmin === true
        ? Result.succeed()
        : Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_ADMIN' })
    ),
    Result.andThen(v => v.db.members.entToTab({ ent: v.memberEnt }))
  );
}
