// import { Controller, Post } from '@nestjs/common';
// import { apiToBackend } from '~backend/barrels/api-to-backend';
// import { common } from '~backend/barrels/common';
// import { entities } from '~backend/barrels/entities';
// import { repositories } from '~backend/barrels/repositories';
// import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

// @Controller()
// export class GetProjectController {
//   constructor(
//     private orgsRepository: repositories.OrgsRepository,
//     private projectsRepository: repositories.ProjectsRepository
//   ) {}

//   @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject)
//   async getProject(
//     @AttachUser() user: entities.UserEntity,
//     @ValidateRequest(apiToBackend.ToBackendGetProjectRequest)
//     reqValid: apiToBackend.ToBackendGetProjectRequest
//   ) {
//     let { projectId } = reqValid.payload;

//     let project = await this.orgsRepository.findOne({ org_id: orgId });

//     if (common.isUndefined(org)) {
//       throw new common.ServerError({
//         message: apiToBackend.ErEnum.BACKEND_ORG_IS_NOT_EXIST
//       });
//     }

//     let project = await this.projectsRepository.findOne({ name: name });

//     let payload: apiToBackend.ToBackendGetProjectResponsePayload = {
//       isExist: common.isDefined(project)
//     };

//     return payload;
//   }
// }
