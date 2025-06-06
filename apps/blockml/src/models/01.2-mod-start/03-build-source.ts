import * as path from 'path';
import { PostgresConnection } from '@malloydata/db-postgres';
import {
  Model,
  ModelDef,
  ModelMaterializer,
  PreparedQuery,
  PreparedResult,
  QueryMaterializer,
  Result,
  Runtime,
  modelDefToModelInfo
} from '@malloydata/malloy';
import {
  ModelEntryValueWithSource,
  ModelInfo
} from '@malloydata/malloy-interfaces';
import {
  ASTAggregateViewOperation,
  ASTQuery,
  ASTSegmentViewDefinition,
  ASTViewOperation
} from '@malloydata/malloy-query-builder';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { BmError } from '~blockml/models/bm-error';
import { MalloyItem } from '~common/interfaces/blockml/internal/malloy-item';

let func = common.FuncEnum.BuildSource;

export async function buildSource(
  item: {
    mods: common.FileMod[];
    tempDir: string;
    projectId: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, projectId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newMods: common.FileMod[] = [];
  let malloyItems: MalloyItem[] = [];

  await forEachSeries(item.mods, async x => {
    let errorsOnStart = item.errors.length;

    let connectionModelItem = malloyItems.find(
      y =>
        y.connectionId === x.connection.connectionId &&
        y.location === x.location
    );

    if (common.isUndefined(connectionModelItem)) {
      let connection =
        x.connection.type === common.ConnectionTypeEnum.PostgreSQL
          ? new PostgresConnection(x.connection.connectionId, () => ({}), {
              host: x.connection.host,
              port: x.connection.port,
              username: x.connection.username,
              password: x.connection.password,
              databaseName: x.connection.databaseName
            })
          : undefined;

      // console.log('x.connection');
      // console.log(x.connection);
      // console.log('connection');
      // console.log(connection);

      let modelPath = x.location;

      let fullModelPath = common.isDefined(projectId)
        ? `${item.tempDir}/${projectId}/${modelPath}`
        : `${item.tempDir}/${modelPath}`;

      let modelUrl = new URL('file://' + fullModelPath);
      let importBaseURL = new URL(
        'file://' + path.dirname(fullModelPath) + '/'
      );

      let urlReader = {
        readURL: async (url: URL) =>
          (
            await nodeCommon.readFileCheckSize({
              filePath: url,
              getStat: false
            })
          ).content
      };

      let runtime = new Runtime({ urlReader, connection });

      let malloyModelMaterializer: ModelMaterializer = runtime.loadModel(
        modelUrl,
        { importBaseURL }
      );

      let start0 = Date.now();

      let malloyModel: Model = await runtime.getModel(modelUrl);

      let malloyModelDef: ModelDef = (await malloyModelMaterializer.getModel())
        ._modelDef;

      // console.log('malloyModelDef');
      // console.log(malloyModelDef);

      let malloyModelInfo: ModelInfo = modelDefToModelInfo(malloyModelDef);

      // console.log('malloyModelInfo');
      // console.dir(malloyModelInfo, { depth: null });

      let qStr = `run: ec1_m2 -> {
  top: 10
  group_by: users.state
  aggregate: orders.orders_count
}`;

      let start1 = Date.now();
      let qm: QueryMaterializer = malloyModelMaterializer.loadQuery(qStr); // 0 ms
      let end1 = Date.now();
      let diff1 = end1 - start1;

      console.log('diff1');
      console.log(diff1);

      // console.log('qm');
      // console.dir(qm, { depth: null });

      // let qSql = await qm.getSQL(); // 11 ms

      // console.log('qSql');
      // console.log(qSql);

      let r: Result = await qm.run();
      console.log('r._queryResult.result');
      console.log(r._queryResult.result);
      // console.log('r.toJSON');
      // console.log(r.toJSON());

      let qPreparedQuery: PreparedQuery = await qm.getPreparedQuery();
      // console.log('qPreparedQuery');
      // console.dir(qPreparedQuery, { depth: null });

      let qPreparedResult: PreparedResult = await qm.getPreparedResult();
      // let qSql = qPreparedResult.sql;

      // console.log('qPreparedResult');
      // console.dir(qPreparedResult, { depth: null });

      connectionModelItem = {
        location: x.location,
        connectionId: x.connection.connectionId,
        malloyModel: malloyModel,
        malloyModelMaterializer: malloyModelMaterializer,
        malloyModelDef: malloyModelDef,
        malloyModelInfo: malloyModelInfo
      };

      malloyItems.push(connectionModelItem);

      let end0 = Date.now();
      let diff0 = end0 - start0;

      // console.log('diff0');
      // console.log(diff0);

      // console.log('malloyModel');
      // console.dir(malloyModel, { depth: null });

      // console.log('malloyModelMaterializer');
      // console.log(malloyModelMaterializer);
    }

    x.malloyEntryValueWithSource =
      connectionModelItem.malloyModelInfo.entries.find(
        y => y.kind === 'source' && y.name === x.source
      ) as ModelEntryValueWithSource;

    let qb = new ASTQuery({
      source: x.malloyEntryValueWithSource,
      query: undefined
    });

    // console.log('qb');
    // console.dir(qb, { depth: null });

    //
    // 1
    //

    let malloyStr1 = qb.toMalloy();
    console.log('malloyStr1');
    console.dir(malloyStr1, { depth: null });

    // let query: Query = qb.build();
    // console.log('query');
    // console.dir(query, { depth: null });

    //
    // 2
    //

    let segment: ASTSegmentViewDefinition = qb.getOrAddDefaultSegment();

    segment.addGroupBy('state', ['users']);
    segment.addAggregate('orders_count');
    segment.addAggregate('users_count', ['users']);

    // console.log('segment');
    // console.dir(segment, { depth: null });

    let malloyStr2 = qb.toMalloy();
    console.log('malloyStr2');
    console.dir(malloyStr2, { depth: null });

    // 3

    // export type ASTViewOperation = ASTGroupByViewOperation | ASTAggregateViewOperation | ASTOrderByViewOperation | ASTNestViewOperation | ASTLimitViewOperation | ASTWhereViewOperation | ASTHavingViewOperation;
    // 'group_by' | 'aggregate' | 'order_by' | 'limit' | 'where' | 'nest' | 'having';

    segment.operations.items
      .filter(
        (operation: ASTViewOperation) =>
          operation instanceof ASTAggregateViewOperation
      )
      .find(y => y.field.name === 'users_count')
      .delete();

    let malloyStr3 = qb.toMalloy();
    console.log('malloyStr3');
    console.dir(malloyStr3, { depth: null });

    if (errorsOnStart === item.errors.length) {
      newMods.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Mods, newMods);

  return { mods: newMods, malloyItems: malloyItems };
}
