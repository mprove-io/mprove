import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';

export function makeSession(item: {
  session_id: string;
  user_id: string;
  is_activated: enums.bEnum;
}): entities.SessionEntity {
  return {
    session_id: item.session_id,
    user_id: item.user_id,
    is_activated: item.is_activated
  };
}
