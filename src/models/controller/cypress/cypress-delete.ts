import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { validator } from '../../../barrels/validator';
import { proc } from '../../../barrels/proc';

export async function cypressDelete(req: Request, res: Response) {
  let payload: api.CypressDeleteRequestBody['payload'] = validator.getPayload(
    req
  );

  let projectIds = payload.project_ids || [];
  let userIds = payload.user_ids || [];

  if (projectIds.length > 0) {
    await proc.processDeletedProjects(projectIds);
  }

  if (userIds.length > 0) {
    await proc.processDeletedUsers(userIds);
  }

  // response

  let responsePayload: api.CypressDeleteResponse200Body['payload'] = {
    empty: true
  };

  res.json({ payload: payload });
}
