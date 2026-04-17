import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateConnectionRequestDto,
  ToBackendCreateConnectionResponseDto
} from '#backend/controllers/connections/create-connection/create-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { StoreService } from '#backend/services/store.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { getMotherduckDatabaseWrongChars } from '#common/functions/check-motherduck-database-name';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendCreateConnectionResponsePayload } from '#common/zod/to-backend/connections/to-backend-create-connection';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateConnectionController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private storeService: StoreService,
    private connectionsService: ConnectionsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateConnection)
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
  ) {
    let { projectId, envId, connectionId, type, options } = body.payload;

    if (isDefined(options.storeApi)) {
      await this.storeService.checkStoreApiUrl({
        urlStr: options.storeApi.baseUrl
      });
    }

    if (isDefined(options.storeGoogleApi)) {
      await this.storeService.checkStoreApiUrl({
        urlStr: options.storeApi.baseUrl
      });
    }

    if (isDefined(options.motherduck)) {
      let wrongChars: string[] = getMotherduckDatabaseWrongChars({
        databaseName: options.motherduck.database
      });

      if (wrongChars?.length > 0) {
        throw new ServerError({
          message: ErEnum.BACKEND_WRONG_MOTHERDUCK_DATABASE_CHARACTERS
        });
      }
    }

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    await this.connectionsService.checkConnectionDoesNotExist({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let newConnection = this.connectionsService.makeConnection({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      type: type,
      options: options
    });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, projectId),
        eq(bridgesTable.envId, envId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      x.needValidate = true;
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                connections: [newConnection]
              },
              insertOrUpdate: {
                bridges: [...branchBridges]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendCreateConnectionResponsePayload = {
      connection: this.connectionsService.tabToApiProjectConnection({
        connection: newConnection,
        isIncludePasswords: false
      })
    };

    return payload;
  }
}
