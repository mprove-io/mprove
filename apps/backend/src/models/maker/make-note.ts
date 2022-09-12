import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeNote(item: {
  noteId?: string;
  privateKey: string;
  publicKey: string;
}) {
  let projectEntity: entities.NoteEntity = {
    note_id: item.noteId || common.makeId(),
    private_key: item.privateKey,
    public_key: item.publicKey,
    server_ts: undefined
  };
  return projectEntity;
}
