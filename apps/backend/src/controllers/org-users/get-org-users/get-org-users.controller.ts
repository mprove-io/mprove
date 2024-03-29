import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { makeFullName } from '~backend/functions/make-full-name';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import {
  MemberEntity,
  UserEntity
} from '~backend/models/store-entities/_index';
import { OrgsService } from '~backend/services/orgs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetOrgUsersController {
  constructor(
    private membersRepository: repositories.MembersRepository,
    private usersRepository: repositories.UsersRepository,
    private avatarsRepository: repositories.AvatarsRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private orgsService: OrgsService,
    private dataSource: DataSource
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers)
  async getOrgUsers(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetOrgUsersRequest = request.body;

    let { orgId, perPage, pageNum } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.user_id
    });

    let projects = await this.projectsRepository.find({
      where: { org_id: orgId }
    });

    let projectIds = projects.map(x => x.project_id);

    let membersPart: MemberEntity[] = await this.dataSource
      .getRepository(MemberEntity)
      .createQueryBuilder('members')
      .select('DISTINCT member_id')
      .where({ project_id: In(projectIds) })
      .getRawMany();

    let userIds = membersPart.map(x => x.member_id);

    let [users, total]: [UserEntity[], number] =
      await this.usersRepository.findAndCount({
        where: {
          user_id: In(userIds)
        },
        order: {
          email: 'ASC'
        },
        take: perPage,
        skip: (pageNum - 1) * perPage
      });

    let members =
      userIds.length === 0
        ? []
        : await this.membersRepository.find({
            where: {
              member_id: In(userIds),
              project_id: In(projectIds)
            }
          });

    let orgUsers: apiToBackend.OrgUsersItem[] = [];

    let avatars =
      userIds.length === 0
        ? []
        : await this.avatarsRepository.find({
            select: ['user_id', 'avatar_small'],
            where: {
              user_id: In(userIds)
            }
          });

    users.forEach(x => {
      let userMembers = members.filter(m => m.member_id === x.user_id);

      let orgUser: apiToBackend.OrgUsersItem = {
        userId: x.user_id,
        avatarSmall: avatars.find(a => a.user_id === x.user_id)?.avatar_small,
        email: x.email,
        alias: x.alias,
        firstName: x.first_name,
        lastName: x.last_name,
        fullName: makeFullName({
          firstName: x.first_name,
          lastName: x.last_name
        }),
        adminProjects: userMembers
          .filter(m => m.is_admin === common.BoolEnum.TRUE)
          .map(m => m.project_id)
          .map(z => {
            let project = projects.find(p => p.project_id === z);
            return project.name;
          }),
        editorProjects: userMembers
          .filter(m => m.is_editor === common.BoolEnum.TRUE)
          .map(m => m.project_id)
          .map(z => {
            let project = projects.find(p => p.project_id === z);
            return project.name;
          }),
        explorerProjects: userMembers
          .filter(m => m.is_explorer === common.BoolEnum.TRUE)
          .map(m => m.project_id)
          .map(z => {
            let project = projects.find(p => p.project_id === z);
            return project.name;
          }),
        projectUserProjects: userMembers
          .map(m => m.project_id)
          .map(z => {
            let project = projects.find(p => p.project_id === z);
            return project.name;
          })
      };

      orgUsers.push(orgUser);
    });

    let payload: apiToBackend.ToBackendGetOrgUsersResponsePayload = {
      orgUsersList: orgUsers,
      total: total
    };

    return payload;
  }
}
