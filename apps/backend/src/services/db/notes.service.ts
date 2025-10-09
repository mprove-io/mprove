import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { NoteTab } from '~backend/drizzle/postgres/schema/_tabs';
import { NoteEnt } from '~backend/drizzle/postgres/schema/notes';
import { isUndefined } from '~common/functions/is-undefined';
import { NoteLt, NoteSt } from '~common/interfaces/st-lt';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class NotesService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(noteEnt: NoteEnt): NoteTab {
    if (isUndefined(noteEnt)) {
      return;
    }

    let note: NoteTab = {
      ...noteEnt,
      ...this.tabService.decrypt<NoteSt>({
        encryptedString: noteEnt.st
      }),
      ...this.tabService.decrypt<NoteLt>({
        encryptedString: noteEnt.lt
      })
    };

    return note;
  }
}
