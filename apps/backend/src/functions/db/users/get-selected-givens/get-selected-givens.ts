import { Result } from '@praha/byethrow';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { selectUnselectedGivens } from '#backend/functions/db/users/select-unselected-givens/select-unselected-givens';
import type { DbService } from '#backend/services/db/db.service';
import type { GetSelectedGivensError } from '#common/types/backend/function-errors/get-selected-givens-error';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';

export async function getSelectedGivens(item: {
  user: UserTab;
  projectId: string;
  db: DbService;
}): Result.ResultAsync<SelectedGiven[], GetSelectedGivensError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      selectUnselectedGivens({
        user: v.user,
        projectId: v.projectId,
        db: v.db
      })
    ),
    Result.map(
      (v): SelectedGiven[] =>
        v.user.ui.projectSelectedGivenLinks?.find(
          link => link.projectId === v.projectId
        )?.givens ?? []
    )
  );
}
