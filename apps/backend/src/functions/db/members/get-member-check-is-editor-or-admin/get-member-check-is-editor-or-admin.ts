import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { DbService } from '#backend/services/db/db.service';
import type { GetMemberCheckIsEditorOrAdminError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-error';

export async function getMemberCheckIsEditorOrAdmin(item: {
  memberId: string;
  projectId: string;
  db: DbService;
}): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorOrAdminError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('member', v =>
      v.db.members.findFirstCheckExists({
        where: and(
          eq(membersTable.memberId, v.memberId),
          eq(membersTable.projectId, v.projectId)
        )
      })
    ),
    Result.andThrough(v =>
      v.member.isEditor !== true && v.member.isAdmin !== true
        ? Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN' })
        : Result.succeed()
    ),
    Result.map((v): MemberTab => v.member)
  );
}
