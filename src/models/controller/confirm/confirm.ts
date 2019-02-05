import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';

export async function confirm(req: Request, res: Response) {
  let payload: api.ConfirmRequestBody['payload'] = validator.getPayload(req);

  let storeMessages = store.getMessagesRepo();

  let message = await storeMessages
    .findOne({
      message_id: payload.reply_to,
      is_confirmed: enums.bEnum.FALSE
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_MESSAGES_FIND_ONE)
    );

  if (message) {
    message.is_confirmed = enums.bEnum.TRUE;

    await storeMessages
      .save(message)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MESSAGES_SAVE));
  }

  // response

  let responsePayload: api.ConfirmResponse200Body['payload'] = {
    empty: true
  };

  sender.sendClientResponse(req, res, responsePayload);
}
