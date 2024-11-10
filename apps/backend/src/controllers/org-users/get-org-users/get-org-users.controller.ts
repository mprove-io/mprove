import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { makeFullName } from '~backend/functions/make-full-name';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetOrgUsersController {
  constructor(
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers)
  async getOrgUsers(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetOrgUsersRequest = request.body;

    let { orgId, perPage, pageNum } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let projects = await this.db.drizzle.query.projectsTable.findMany({
      where: eq(projectsTable.orgId, orgId)
    });

    // let projects = await this.projectsRepository.find({
    //   where: { org_id: orgId }
    // });

    let projectIds = projects.map(x => x.projectId);

    let memberParts = await this.db.drizzle
      .select({
        memberId: sql<string>`DISTINCT ${membersTable.memberId}`
      })
      .from(membersTable)
      .where(inArray(membersTable.projectId, projectIds));

    // let membersPart: MemberEntity[] = await this.dataSource
    //   .getRepository(MemberEntity)
    //   .createQueryBuilder('members')
    //   .select('DISTINCT member_id')
    //   .where({ project_id: In(projectIds) })
    //   .getRawMany();

    let userIds = memberParts.map(x => x.memberId);

    let usersResult = await this.db.drizzle
      .select({
        record: usersTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(usersTable)
      .where(inArray(usersTable.userId, userIds))
      .orderBy(asc(usersTable.email))
      .limit(perPage)
      .offset((pageNum - 1) * perPage);

    // let [users, total]: [UserEntity[], number] =
    //   await this.usersRepository.findAndCount({
    //     where: {
    //       user_id: In(userIds)
    //     },
    //     order: {
    //       email: 'ASC'
    //     },
    //     take: perPage,
    //     skip: (pageNum - 1) * perPage
    //   });

    let users = usersResult.map(x => x.record);

    let members =
      userIds.length === 0
        ? []
        : await this.db.drizzle.query.membersTable.findMany({
            where: and(
              inArray(membersTable.memberId, userIds),
              inArray(membersTable.projectId, projectIds)
            )
          });

    // await this.membersRepository.find({
    //     where: {
    //       member_id: In(userIds),
    //       project_id: In(projectIds)
    //     }
    //   });

    let orgUsers: apiToBackend.OrgUsersItem[] = [];

    let avatars =
      userIds.length === 0
        ? []
        : await this.db.drizzle
            .select({
              userId: avatarsTable.userId,
              avatarSmall: avatarsTable.avatarSmall
            })
            .from(avatarsTable)
            .where(inArray(avatarsTable.userId, userIds));

    // await this.avatarsRepository.find({
    //     select: ['user_id', 'avatar_small'],
    //     where: {
    //       user_id: In(userIds)
    //     }
    //   });

    users.forEach(x => {
      let userMembers = members.filter(m => m.memberId === x.userId);

      let orgUser: apiToBackend.OrgUsersItem = {
        userId: x.userId,
        avatarSmall: avatars.find(a => a.userId === x.userId)?.avatarSmall,
        email: x.email,
        alias: x.alias,
        firstName: x.firstName,
        lastName: x.lastName,
        fullName: makeFullName({
          firstName: x.firstName,
          lastName: x.lastName
        }),
        adminProjects: userMembers
          .filter(m => m.isAdmin === true)
          .map(m => m.projectId)
          .map(y => {
            let project = projects.find(p => p.projectId === y);
            return project.name;
          }),
        editorProjects: userMembers
          .filter(m => m.isEditor === true)
          .map(m => m.projectId)
          .map(y => {
            let project = projects.find(p => p.projectId === y);
            return project.name;
          }),
        explorerProjects: userMembers
          .filter(m => m.isExplorer === true)
          .map(m => m.projectId)
          .map(y => {
            let project = projects.find(p => p.projectId === y);
            return project.name;
          }),
        projectUserProjects: userMembers
          .map(m => m.projectId)
          .map(y => {
            let project = projects.find(p => p.projectId === y);
            return project.name;
          })
      };

      orgUsers.push(orgUser);
    });

    let payload: apiToBackend.ToBackendGetOrgUsersResponsePayload = {
      orgUsersList: orgUsers,
      total: usersResult[0].total
    };

    return payload;
  }
}
