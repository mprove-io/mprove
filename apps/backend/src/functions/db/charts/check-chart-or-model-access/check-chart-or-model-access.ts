import { Result } from '@praha/byethrow';
import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { checkMemberAccess } from '#backend/functions/db/members/check-member-access/check-member-access';
import { checkModelAccess } from '#backend/functions/db/models/check-model-access/check-model-access';
import type { CheckChartOrModelAccessError } from '#common/types/backend/function-errors/check-chart-or-model-access-error';
import type { Member } from '#common/types/backend/parts/member';

export type CheckChartOrModelAccessOutput = {
  hasChartAccess: boolean;
  hasModelAccess: boolean;
};

export function checkChartOrModelAccess(item: {
  chart: ChartTab;
  model: ModelTab;
  userMember: MemberTab | Member;
}): Result.Result<CheckChartOrModelAccessOutput, CheckChartOrModelAccessError> {
  let { chart, model, userMember } = item;

  let hasChartAccess: boolean = checkMemberAccess({
    member: userMember,
    accessRoles: chart.accessRolesCombined,
    filePath: chart.filePath
  });

  let hasModelAccess: boolean = checkModelAccess({
    member: userMember,
    modelAccessRoles: model.accessRolesCombined
  });

  if (hasChartAccess === false && hasModelAccess === false) {
    return Result.fail({ code: 'BACKEND_FORBIDDEN_MODEL' });
  }

  return Result.succeed({
    hasChartAccess: hasChartAccess,
    hasModelAccess: hasModelAccess
  });
}
