import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import type { DbService } from '#backend/services/db/db.service';
import type { CheckMemberDoesNotExistError } from '#common/types/backend/function-errors/check-member-does-not-exist-error';

export async function checkMemberDoesNotExist(item: {
  memberId: string;
  projectId: string;
  db: DbService;
}): Result.ResultAsync<void, CheckMemberDoesNotExistError> {
  let { projectId, memberId, db } = item;

  let isMemberExist: boolean = await db.members.isExistUnwrap({
    where: and(
      eq(membersTable.memberId, memberId),
      eq(membersTable.projectId, projectId)
    )
  });

  return isMemberExist
    ? Result.fail({ code: 'BACKEND_MEMBER_ALREADY_EXISTS' })
    : Result.succeed();
}
