import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';

export function getReportAuthor(item: {
  report: ReportTab;
}): string | undefined {
  let { report } = item;

  let author: string;

  if (isDefined(report.filePath)) {
    let filePathArray = report.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;
  }

  return author;
}
