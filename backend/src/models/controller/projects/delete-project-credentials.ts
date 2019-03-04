import { Request, Response } from 'express';
import { forEach } from 'p-iteration';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { blockml } from '../../../barrels/blockml';
import { config } from '../../../barrels/config';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { interfaces } from '../../../barrels/interfaces';
import { proc } from '../../../barrels/proc';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';
import { handler } from '../../../barrels/handler';

export async function deleteProjectCredentials(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.DeleteProjectCredentialsRequestBody['payload'] = validator.getPayload(
    req
  );

  let projectId = payload.project_id;
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

  let fileId = `${config.DISK_BIGQUERY_CREDENTIALS_PATH}/${projectId}.json`;

  await disk
    .removePath(fileId)
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_REMOVE_PATH));

  project.bigquery_project = null;
  project.bigquery_client_email = null;
  project.bigquery_credentials = null;
  project.bigquery_credentials_file_path = null;
  project.has_credentials = enums.bEnum.FALSE;

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

  // response

  let responsePayload: api.DeleteProjectCredentialsResponse200Body['payload'] = {
    project: wrapper.wrapToApiProject(project)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
