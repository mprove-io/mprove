import { Result } from '@praha/byethrow';
import type { NoteTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { NoteEnt } from '#backend/drizzle/postgres/schema/notes';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { NoteEntToTabError } from '#common/types/backend/function-errors/note-ent-to-tab-error';
import type { NoteLt } from '#common/types/shared/st-lt/notes/note-lt';
import type { NoteSt } from '#common/types/shared/st-lt/notes/note-st';

export function noteEntToTab(item: {
  ent: NoteEnt;
  tabService: TabService;
}): Result.Result<NoteTab, NoteEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<NoteSt, NoteLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): NoteTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
