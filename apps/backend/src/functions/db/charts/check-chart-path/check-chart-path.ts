import { Result } from '@praha/byethrow';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import type { CheckChartPathError } from '#common/types/backend/function-errors/check-chart-path-error';

export function checkChartPath(item: {
  filePath: string;
  userAlias: string;
}): Result.Result<void, CheckChartPathError> {
  let { filePath, userAlias } = item;

  let filePathArray: string[] = filePath.split('/');

  let usersFolderIndex: number = filePathArray.findIndex(
    x => x === MPROVE_USERS_FOLDER
  );

  if (
    usersFolderIndex < 0 ||
    filePathArray.length === usersFolderIndex + 1 ||
    filePathArray[usersFolderIndex + 1] !== userAlias
  ) {
    return Result.fail({ code: 'BACKEND_FORBIDDEN_CHART_PATH' });
  }

  return Result.succeed();
}
