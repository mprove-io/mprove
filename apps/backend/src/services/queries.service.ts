import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class QueriesService {
  constructor(private queriesRepository: repositories.QueriesRepository) {}

  async getQueryCheckExists(item: { queryId: string }) {
    let { queryId: queryId } = item;

    let query = await this.queriesRepository.findOne({
      query_id: queryId
    });

    if (common.isUndefined(query)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }
}
