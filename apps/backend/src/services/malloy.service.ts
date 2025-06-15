import { PostgresConnection } from '@malloydata/db-postgres';
import {
  LogMessage,
  ModelInfo as MalloyModelInfo,
  Query as MalloyQuery,
  ModelEntryValueWithSource
} from '@malloydata/malloy-interfaces';
import {
  ASTQuery,
  ASTSegmentViewDefinition
} from '@malloydata/malloy-query-builder';
import {
  Runtime as MalloyRuntime,
  ModelMaterializer,
  PreparedQuery,
  PreparedResult,
  QueryMaterializer,
  malloyToQuery,
  modelDefToModelInfo
} from '@malloydata/malloy/index';
import { Inject, Injectable } from '@nestjs/common';
import * as fse from 'fs-extra';
import { common } from '~backend/barrels/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { QueryOperationEnum } from '~common/enums/query-operation.enum';

@Injectable()
export class MalloyService {
  constructor(
    // private envsService: EnvsService,
    // private storeService: StoreService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async createMalloyQuery(item: {
    queryOperation: QueryOperationEnum;
    mconfig: common.Mconfig;
    model: common.Model;
    malloyConnections: PostgresConnection[];
  }) {
    let { queryOperation, mconfig, model, malloyConnections } = item;

    let malloyToQueryResult = malloyToQuery(mconfig.malloyQuery);

    let q1: MalloyQuery = malloyToQueryResult.query;
    let logs: LogMessage[] = malloyToQueryResult.logs;

    let malloyModelInfo: MalloyModelInfo = modelDefToModelInfo(
      model.malloyModelDef
    );

    let malloyEntryValueWithSource = malloyModelInfo.entries.find(
      y => y.kind === 'source' && y.name === (q1.definition as any).source.name
    ) as ModelEntryValueWithSource;

    let astQuery: ASTQuery = new ASTQuery({
      source: malloyEntryValueWithSource,
      query: q1
    });

    let segment0: ASTSegmentViewDefinition = astQuery.getOrAddDefaultSegment();

    if (queryOperation === common.QueryOperationEnum.Select) {
      segment0.addAggregate('orders_count');
    } else {
      //   segment.addAggregate('users_count', ['users']);
      //   segment.addGroupBy('state', ['users']);
      // segment0.addWhere('state', ['users'], 'WN, AA');
      //   // export type ASTViewOperation = ASTGroupByViewOperation | ASTAggregateViewOperation | ASTOrderByViewOperation | ASTNestViewOperation | ASTLimitViewOperation | ASTWhereViewOperation | ASTHavingViewOperation;
      //   // 'group_by' | 'aggregate' | 'order_by' | 'limit' | 'where' | 'nest' | 'having';
      //   segment.operations.items
      //     .filter(
      //       (operation: ASTViewOperation) =>
      //         operation instanceof ASTAggregateViewOperation
      //     )
      //     .find(y => y.field.name === 'users_count')
      //     .delete();
    }

    let newMalloyQuery = astQuery.toMalloy();

    let runtime = new MalloyRuntime({
      urlReader: {
        readURL: async (url: URL) => await fse.readFile(url, 'utf8')
      },
      connections: {
        lookupConnection: async function (name: string) {
          return malloyConnections.find(mc => mc.name === name);
        }
      }
    });

    let mm: ModelMaterializer = runtime._loadModelFromModelDef(
      model.malloyModelDef
    );

    // let malloyModel = await mm.getModel();

    // let queryMalloyModel: MalloyModel = await Malloy.compile({
    //   urlReader: runtime.urlReader,
    //   connections: runtime.connections,
    //   model: malloyModel,
    //   parse: Malloy.parse({ source: mconfig.malloyQuery })
    // });

    let qm: QueryMaterializer = mm.loadQuery(newMalloyQuery); // 0 ms

    let pq: PreparedQuery = await qm.getPreparedQuery();
    let pr: PreparedResult = pq.getPreparedResult();

    //

    let newMconfig: common.Mconfig;
    let newQuery: common.Query;

    let isError = false;
    let errorMessage: string;

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }
}
