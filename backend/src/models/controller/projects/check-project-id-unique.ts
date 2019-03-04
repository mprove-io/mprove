import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { disk } from '../../../barrels/disk';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { MyRegex } from '../../my-regex';

export async function checkProjectIdUnique(req: Request, res: Response) {
  let projectId: api.CheckProjectIdUniqueRequestBody['payload']['project_id'] = validator.getPayloadProjectId(
    req
  );

  projectId = projectId.toLowerCase();

  let storeProjects = store.getProjectsRepo();

  let dbProject = await storeProjects
    .findOne(projectId) // also deleted
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
    );

  let diskProject = await disk
    .isProjectExistOnDisk(projectId)
    .catch(e =>
      helper.reThrow(e, enums.diskErrorsEnum.DISK_IS_PROJECT_EXIST_ON_DISK)
    );

  let isUnique = !dbProject && !diskProject;

  let isValid = true;

  if (
    projectId.length < 4 ||
    projectId.match(MyRegex.PROJECT_NAME_CONTAINS_WRONG_CHARS()) ||
    projectId.match(MyRegex.PROJECT_NAME_DOES_NOT_START_WITH_LETTER())
  ) {
    isValid = false;
  }

  let payload: api.CheckProjectIdUniqueResponse200Body['payload'] = {
    project_id: projectId,
    is_unique: isUnique,
    is_valid: isValid
  };

  sender.sendClientResponse(req, res, payload);
}
