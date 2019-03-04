import { validator } from '../../barrels/validator';

export async function checkRequestId(req: any, res: any, next: any) {
  let requestId = validator.getInfoRequestId(req);

  next();
}
