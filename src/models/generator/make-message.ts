import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';

export function makeMessage(item: {
  message_id: string;
  content: string;
  session_id: string;
  chunk_id: string;
  chunk_server_ts: string;
  last_send_attempt_ts: string;
  is_sent: enums.bEnum;
}): entities.MessageEntity {
  return {
    message_id: item.message_id,
    content: item.content,
    session_id: item.session_id,
    chunk_id: item.chunk_id,
    chunk_server_ts: item.chunk_server_ts,
    last_send_attempt_ts: item.last_send_attempt_ts,
    is_sent: item.is_sent,
    is_confirmed: enums.bEnum.FALSE
  };
}
