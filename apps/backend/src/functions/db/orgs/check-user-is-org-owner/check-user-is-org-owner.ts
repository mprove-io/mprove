import { Result } from '@praha/byethrow';
import type { OrgTab } from '#backend/drizzle/postgres/tables/orgs';
import type { CheckUserIsOrgOwnerError } from '#common/types/backend/function-errors/check-user-is-org-owner-error';

export function checkUserIsOrgOwner(item: {
  userId: string;
  org: OrgTab;
}): Result.Result<void, CheckUserIsOrgOwnerError> {
  let { org, userId } = item;

  if (org.ownerId !== userId) {
    return Result.fail({ code: 'BACKEND_ONLY_ORG_OWNER_CAN_ACCESS' });
  }

  return Result.succeed();
}
