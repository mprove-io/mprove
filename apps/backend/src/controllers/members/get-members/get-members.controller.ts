import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetMembersController {
  constructor(
    private membersRepository: repositories.MembersRepository,
    private avatarsRepository: repositories.AvatarsRepository,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers)
  async getMembers(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetMembersRequest = request.body;

    let { projectId, perPage, pageNum } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      memberId: user.user_id,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      userMember.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    const [members, total] = await this.membersRepository.findAndCount({
      where: {
        project_id: projectId
      },
      order: {
        email: 'ASC'
      },
      take: perPage,
      skip: (pageNum - 1) * perPage
    });

    let memberIds = members.map(x => x.member_id);

    let avatars =
      memberIds.length === 0
        ? []
        : await this.avatarsRepository.find({
            select: ['user_id', 'avatar_small'],
            where: {
              user_id: In(memberIds)
            }
          });

    let apiMembers = members.map(x => wrapper.wrapToApiMember(x));

    apiMembers.forEach(x => {
      let av = avatars.find(a => a.user_id === x.memberId);
      if (common.isDefined(av)) {
        x.avatarSmall = av.avatar_small;
      }
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetMembersResponsePayload = {
      userMember: apiMember,
      members: apiMembers,
      total: total
    };

    return payload;
  }
}
