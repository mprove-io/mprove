import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';

export function makeMessage(item: {
  message_id: string;
  content: string;
  session_id: string;
  chunk_id: string;
  server_ts: string;
}): entities.MessageEntity {
  return {
    message_id: item.message_id,
    content: item.content,
    session_id: item.session_id,
    chunk_id: item.chunk_id,
    is_confirmed: enums.bEnum.FALSE,
    server_ts: item.server_ts
  };
}
