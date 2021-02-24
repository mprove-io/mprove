// import { Controller, Post } from '@nestjs/common';
// import { In } from 'typeorm';
// import { apiToBackend } from '~backend/barrels/api-to-backend';
// import { common } from '~backend/barrels/common';
// import { entities } from '~backend/barrels/entities';
// import { repositories } from '~backend/barrels/repositories';
// import { wrapper } from '~backend/barrels/wrapper';
// import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
// import { MembersService } from '~backend/services/members.service';
// import { ProjectsService } from '~backend/services/projects.service';

// @Controller()
// export class CreateMemberController {
//   constructor(
//     private membersRepository: repositories.MembersRepository,
//     private avatarsRepository: repositories.AvatarsRepository,
//     private projectsService: ProjectsService,
//     private membersService: MembersService
//   ) {}

//   @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember)
//   async createMember(
//     @AttachUser() user: entities.UserEntity,
//     @ValidateRequest(apiToBackend.ToBackendCreateMemberRequest)
//     reqValid: apiToBackend.ToBackendCreateMemberRequest
//   ) {
//     let { projectId, email } = reqValid.payload;

//     await this.projectsService.getProjectCheckExists({
//       projectId: projectId
//     });

//     await this.membersService.checkMemberIsProjectAdmin({
//       memberId: user.user_id,
//       projectId: projectId
//     });

//     let members = await this.membersRepository.find({ project_id: projectId });

//     let memberIds = members.map(x => x.member_id);

//     let avatars = await this.avatarsRepository.find({
//       select: ['user_id', 'avatar_small'],
//       where: {
//         user_id: In(memberIds)
//       }
//     });

//     let apiMembers = members.map(x => wrapper.wrapToApiMember(x));

//     apiMembers.forEach(x => {
//       let av = avatars.find(a => a.user_id === x.memberId);
//       if (common.isDefined(av)) {
//         x.avatarSmall = av.avatar_small;
//       }
//     });

//     let payload: apiToBackend.ToBackendCreateMemberResponsePayload = {
//       members: apiMembers
//     };

//     return payload;
//   }
// }
