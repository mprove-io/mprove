import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function setProjectQuerySizeLimit(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.SetProjectQuerySizeLimitRequestBody['payload'] = validator.getPayload(
    req
  );

  let projectId = payload.project_id;
  let querySizeLimit = payload.query_size_limit;
  let serverTs = payload.server_ts;

  let storeProjects = store.getProjectsRepo();

  let project = <entities.ProjectEntity>(
    await storeProjects
      .findOne(projectId)
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
      )
  );

  if (!project) {
    throw new ServerError({ name: enums.otherErrorsEnum.PROJECT_NOT_FOUND });
  }

  helper.checkServerTs(project, serverTs);

  project.query_size_limit = querySizeLimit;

  // update server_ts

  let newServerTs = helper.makeTs();

  project.server_ts = newServerTs;

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            projects: [project]
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  let responsePayload: api.SetProjectQuerySizeLimitResponse200Body['payload'] = {
    project: wrapper.wrapToApiProject(project)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
