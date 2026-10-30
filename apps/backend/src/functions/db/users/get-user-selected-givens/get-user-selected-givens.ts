import { Result } from '@praha/byethrow';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { selectUserUnselectedGivens } from '#backend/functions/db/users/select-user-unselected-givens/select-user-unselected-givens';
import type { DbService } from '#backend/services/db/db.service';
import type { GetUserSelectedGivensError } from '#common/types/backend/function-errors/get-user-selected-givens-error';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';

export async function getUserSelectedGivens(item: {
  user: UserTab;
  projectId: string;
  db: DbService;
}): Result.ResultAsync<SelectedGiven[], GetUserSelectedGivensError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      selectUserUnselectedGivens({
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
