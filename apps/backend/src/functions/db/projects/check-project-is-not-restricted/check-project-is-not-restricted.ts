import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckProjectIsNotRestrictedError } from '#common/types/backend/function-errors/check-project-is-not-restricted-error';

export function checkProjectIsNotRestricted(item: {
  projectId: string;
  userMember: MemberTab;
  repoId?: string;
  cs: ConfigService<BackendConfig>;
}): Result.Result<void, CheckProjectIsNotRestrictedError> {
  let { projectId, userMember, repoId, cs } = item;

  let demoProjectId: string =
    cs.get<BackendConfig['demoProjectId']>('demoProjectId');

  if (
    userMember.isAdmin === false &&
    projectId === demoProjectId &&
    (isUndefined(repoId) || repoId === PROD_REPO_ID)
  ) {
    return Result.fail({
      code: 'BACKEND_RESTRICTED_PROJECT'
    });
  }

  return Result.succeed();
}
