import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';

export function makeChunkSession(item: {
  chunk_id: string;
  session_id: string;
}): entities.ChunkSessionEntity {
  return {
    chunk_id: item.chunk_id,
    session_id: item.session_id
  };
}
