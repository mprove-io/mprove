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
  ToBackendEditConnectionRequestDto,
  ToBackendEditConnectionResponseDto
} from '#backend/controllers/connections/edit-connection/edit-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { StoreService } from '#backend/services/store.service';
import { TabService } from '#backend/services/tab.service';
import {
  DEFAULT_QUERY_SIZE_LIMIT,
  THROTTLE_CUSTOM
} from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { getMotherduckDatabaseWrongChars } from '#common/functions/check-motherduck-database-name';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendEditConnectionResponsePayload } from '#common/zod/to-backend/connections/to-backend-edit-connection';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditConnectionController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private storeService: StoreService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditConnection)
  @ApiOperation({
    summary: 'EditConnection',
    description: 'Update options of an existing connection'
  })
  @ApiOkResponse({
    type: ToBackendEditConnectionResponseDto
  })
  async editConnection(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditConnectionRequestDto
  ) {
    let { projectId, envId, connectionId, options } = body.payload;

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

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let connection = await this.connectionsService.getConnectionCheckExists({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId
    });

    if (isDefined(options.storeGoogleApi)) {
      options.storeGoogleApi.googleCloudProject =
        options.storeGoogleApi.serviceAccountCredentials?.project_id;

      options.storeGoogleApi.googleCloudClientEmail =
        options.storeGoogleApi.serviceAccountCredentials?.client_email;
    }

    if (isDefined(options.bigquery)) {
      options.bigquery.googleCloudProject =
        options.bigquery.serviceAccountCredentials?.project_id;

      options.bigquery.googleCloudClientEmail =
        options.bigquery.serviceAccountCredentials?.client_email;

      let slimit = options.bigquery.bigqueryQuerySizeLimitGb;

      options.bigquery.bigqueryQuerySizeLimitGb =
        isDefined(slimit) && slimit > 0 ? slimit : DEFAULT_QUERY_SIZE_LIMIT;
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

    this.connectionsService.cleanInternalFields({ options: options });

    connection.options = options;

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
              insertOrUpdate: {
                connections: [connection],
                bridges: [...branchBridges]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendEditConnectionResponsePayload = {
      connection: this.connectionsService.tabToApiProjectConnection({
        connection: connection,
        isIncludePasswords: false
      })
    };

    return payload;
  }
}
