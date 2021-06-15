import { Controller, Post } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ConnectionsService } from '~backend/services/connections.service';
import { MembersService } from '~backend/services/members.service';
import { QueriesService } from '~backend/services/queries.service';
import { RunService } from '~backend/services/run.service';

@Controller()
export class RunQueriesController {
  constructor(
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private runService: RunService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries)
  async runQueries(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendRunQueriesRequest)
    reqValid: apiToBackend.ToBackendRunQueriesRequest
  ) {
    let { queryIds } = reqValid.payload;

    let runningQueries: entities.QueryEntity[] = [];

    await asyncPool(1, queryIds, async queryId => {
      let query = await this.queriesService.getQueryCheckExists({
        queryId: queryId
      });

      let member = await this.membersService.getMemberCheckExists({
        projectId: query.project_id,
        memberId: user.user_id
      });

      let connection = await this.connectionsService.getConnectionCheckExists({
        projectId: query.project_id,
        connectionId: query.connection_id
      });

      let recordsQuery = await this.runService.runQuery({
        userId: user.user_id,
        query: query,
        connection: connection
      });

      runningQueries.push(recordsQuery);
    });

    let payload: apiToBackend.ToBackendRunQueriesResponsePayload = {
      runningQueries: runningQueries.map(x => wrapper.wrapToApiQuery(x))
    };

    return payload;
  }
}