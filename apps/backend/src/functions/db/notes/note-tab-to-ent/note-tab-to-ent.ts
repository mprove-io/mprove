import { Result } from '@praha/byethrow';
import type { NoteEnt, NoteTab } from '#backend/drizzle/postgres/tables/notes';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { NoteLt } from '#common/types/shared/st-lt/notes/note-lt';
import type { NoteSt } from '#common/types/shared/st-lt/notes/note-st';

export function noteTabToEnt(item: {
  tab: NoteTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<NoteEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let noteSt: NoteSt = {};

  let noteLt: NoteLt = {
    publicKey: tab.publicKey,
    privateKey: tab.privateKey,
    publicKeyEncrypted: tab.publicKeyEncrypted,
    privateKeyEncrypted: tab.privateKeyEncrypted,
    passPhrase: tab.passPhrase
  };

  let noteEnt: NoteEnt = {
    noteId: tab.noteId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: noteSt,
      dataLt: noteLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(noteEnt);
}
