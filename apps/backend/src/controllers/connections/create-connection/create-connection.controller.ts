import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendCreateConnectionRequestDto,
  ToBackendCreateConnectionResponseDto
} from '#backend/controllers/connections/create-connection/create-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BridgeTab,
  ConnectionTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { UrlService } from '#backend/services/url/url.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { getMotherduckDatabaseWrongChars } from '#common/functions/get-motherduck-database-wrong-chars/get-motherduck-database-wrong-chars';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateConnectionOutput } from '#common/types/backend/routes/connections/create-connection/create-connection-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateConnectionController {
  constructor(
    private urlService: UrlService,
    private connectionsService: ConnectionsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendCreateConnection' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateConnection',
    description: 'Create a new connection in a project environment'
  })
  @ApiOkResponse({
    type: ToBackendCreateConnectionResponseDto
  })
  async createConnection(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateConnectionRequestDto
  ): Promise<BackendResultForOperation<'createConnection'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        connectionId: body.input.connectionId,
        type: body.input.type,
        options: body.input.options,
        userId: user.userId
      }),
      Result.andThrough(v =>
        isDefined(v.options.storeApi)
          ? this.urlService.checkApiUrl({
              urlStr: v.options.storeApi.baseUrl
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isDefined(v.options.storeGoogleApi)
          ? this.urlService.checkApiUrl({
              urlStr: v.options.storeApi.baseUrl
            })
          : Result.succeed()
      ),
      Result.andThrough(v => {
        if (isUndefined(v.options.motherduck)) {
          return Result.succeed();
        }

        let wrongChars: string[] = getMotherduckDatabaseWrongChars({
          databaseName: v.options.motherduck.database
        });

        return wrongChars?.length > 0
          ? Result.fail({
              code: 'BACKEND_WRONG_MOTHERDUCK_DATABASE_CHARACTERS'
            })
          : Result.succeed();
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.userId),
              eq(membersTable.projectId, v.projectId)
            )
          })
      ),
      Result.andThrough(v =>
        this.connectionsService.checkConnectionDoesNotExist({
          projectId: v.projectId,
          envId: v.envId,
          connectionId: v.connectionId
        })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.member
        })
      ),
      Result.bind(
        'connection',
        (v): Result.Result<ConnectionTab, never> =>
          Result.succeed(
            this.connectionsService.makeConnection({
              projectId: v.projectId,
              envId: v.envId,
              connectionId: v.connectionId,
              type: v.type,
              options: v.options
            })
          )
      ),
      Result.bind(
        'branchBridges',
        (v): Result.ResultAsync<BridgeTab[], BridgeEntToTabError> =>
          this.db.bridges.findMany({
            where: and(
              eq(bridgesTable.projectId, v.projectId),
              eq(bridgesTable.envId, v.envId)
            )
          })
      ),
      Result.map(v => {
        v.branchBridges.forEach(bridge => {
          bridge.needValidate = true;
        });
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insert: { connections: [v.connection] },
          insertOrUpdate: { bridges: [...v.branchBridges] }
        })
      ),
      Result.map(
        (v): ToBackendCreateConnectionOutput => ({
          connection: this.connectionsService.tabToApiProjectConnection({
            connection: v.connection,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
