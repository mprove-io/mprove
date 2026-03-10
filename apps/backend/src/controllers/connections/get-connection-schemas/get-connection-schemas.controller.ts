import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, eq, sql } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { MysqlService } from '#backend/services/dwh/mysql.service';
import { PgService } from '#backend/services/dwh/pg.service';
import { TabService } from '#backend/services/tab.service';
import { TabToEntService } from '#backend/services/tab-to-ent.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ConnectionSchema,
  ConnectionSchemaItem
} from '#common/interfaces/backend/connection-schema';
import { ConnectionLt, ConnectionSt } from '#common/interfaces/st-lt';
import {
  ToBackendGetConnectionSchemasRequest,
  ToBackendGetConnectionSchemasResponsePayload
} from '#common/interfaces/to-backend/connections/to-backend-get-connection-schemas';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSchemasController {
  constructor(
    private tabService: TabService,
    private tabToEntService: TabToEntService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private pgService: PgService,
    private mysqlService: MysqlService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas)
  async getConnectionSchemas(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetConnectionSchemasRequest = request.body;
    let { projectId, envId, isRefresh } = reqValid.payload;

    isRefresh = isRefresh !== false;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let connections: ConnectionTab[] =
      await this.db.drizzle.query.connectionsTable
        .findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            eq(connectionsTable.envId, envId)
          )
        })
        .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));

    let eligibleConnections = connections.filter(
      c =>
        c.type !== ConnectionTypeEnum.GoogleApi &&
        c.type !== ConnectionTypeEnum.Api &&
        (c.type === ConnectionTypeEnum.PostgreSQL ||
          c.type === ConnectionTypeEnum.MySQL)
    );

    let connectionSchemaItems: ConnectionSchemaItem[];

    if (isRefresh === true) {
      let schemaResults: ConnectionSchemaItem[] = await Promise.all(
        eligibleConnections.map(async connection => {
          let schema: ConnectionSchema;

          if (connection.type === ConnectionTypeEnum.PostgreSQL) {
            schema = await this.pgService.fetchSchema({
              connection: connection
            });
          } else if (connection.type === ConnectionTypeEnum.MySQL) {
            schema = await this.mysqlService.fetchSchema({
              connection: connection
            });
          }

          if (isDefined(schema)) {
            connection.schema = schema;
          }

          return {
            connectionId: connection.connectionId,
            schema: schema
          };
        })
      );

      let connectionsToUpdate = eligibleConnections.filter(c =>
        isDefined(c.schema)
      );

      if (connectionsToUpdate.length > 0) {
        let serverTs = makeTsNumber();

        for (let c of connectionsToUpdate) {
          let connectionSt: ConnectionSt = { options: c.options };
          let connectionLt: ConnectionLt = { schema: c.schema };

          let entProps = this.tabToEntService.getEntProps({
            dataSt: connectionSt,
            dataLt: connectionLt,
            isMetadata: false
          });

          await this.db.drizzle.execute(
            sql`UPDATE connections SET lt = ${JSON.stringify(entProps.lt)}::json, server_ts = ${serverTs} WHERE connection_full_id = ${c.connectionFullId}`
          );
        }
      }

      connectionSchemaItems = schemaResults;
    } else {
      connectionSchemaItems = eligibleConnections
        .filter(x => isDefined(x.schema))
        .map(x => ({
          connectionId: x.connectionId,
          schema: x.schema
        }));
    }

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let payload: ToBackendGetConnectionSchemasResponsePayload = {
      userMember: apiUserMember,
      connectionSchemaItems: connectionSchemaItems
    };

    return payload;
  }
}
