import { Request } from 'express';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { ServerError } from '../server-error';

export function getPayloadProjectId(req: Request) {
  let projectId;
  let err;

  try {
    projectId = req.body.payload.project_id;
  } catch (e) {
    err = true;
  }

  if (err || helper.isNullOrEmpty(projectId)) {
    throw new ServerError({ name: enums.otherErrorsEnum.API_ERROR });
  }

  return projectId;
}
