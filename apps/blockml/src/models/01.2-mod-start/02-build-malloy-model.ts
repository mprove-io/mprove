import { PostgresConnection } from '@malloydata/db-postgres';
import { Model as MalloyModel, Runtime } from '@malloydata/malloy';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.BuildMalloyModel;

export async function buildMalloyModel(
  item: {
    connections: common.ProjectConnection[];
    tempDir: string;
    projectId: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, projectId, connections } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let malloyConnections = connections.map(c => {
    let mConnection =
      c.type === common.ConnectionTypeEnum.PostgreSQL
        ? new PostgresConnection(c.connectionId, () => ({}), {
            host: c.host,
            port: c.port,
            username: c.username,
            password: c.password,
            databaseName: c.databaseName
          })
        : undefined;

    return mConnection;
  });

  let runtime = new Runtime({
    urlReader: {
      readURL: async (url: URL) => await fse.readFile(url, 'utf8')
    },
    connections: {
      lookupConnection: async function (name: string) {
        return malloyConnections.find(mc => mc.name === name);
      }
    }
  });

  let modelPath = 'mprove-main.malloy';
  let modelPath1 = 'mods/c2/ec1_m2.malloy';
  let modelPath2 = 'mods/c3/ec1_m3.malloy';

  let fullModelPath = common.isDefined(projectId)
    ? `${item.tempDir}/${projectId}/${modelPath}`
    : `${item.tempDir}/${modelPath}`;

  let fullModelPath1 = common.isDefined(projectId)
    ? `${item.tempDir}/${projectId}/${modelPath1}`
    : `${item.tempDir}/${modelPath1}`;

  let fullModelPath2 = common.isDefined(projectId)
    ? `${item.tempDir}/${projectId}/${modelPath2}`
    : `${item.tempDir}/${modelPath2}`;

  let modelUrl = new URL('file://' + fullModelPath);
  let modelUrl1 = new URL('file://' + fullModelPath1);
  let modelUrl2 = new URL('file://' + fullModelPath2);

  let malloyModel: MalloyModel;

  let start0 = Date.now();

  let promises = [runtime.getModel(modelUrl1), runtime.getModel(modelUrl2)];

  // getWrapResult<CheckVoiceResult>({
  //   name: 'promiseCheckAudioHasVoice',
  //   promise: this.vadService.checkAudioHasVoice({
  //     filePathSource: filePathSource,
  //     audioData: audioData,
  //     isOp: headerAppPlatform === 'web'
  //   })
  // }).catch(error => errorToWrapResult<CheckVoiceResult>(error))

  // let results = await Promise.all(promises);

  malloyModel = await runtime.getModel(modelUrl);

  runtime.loadModel(modelUrl);

  console.log('diff0');
  console.log(Date.now() - start0);

  // malloyModel.getSourceByName

  // let importBaseURL = new URL('file://' + path.dirname(fullModelPath) + '/');
  // let malloyModelMaterializer: ModelMaterializer = runtime.loadModel(modelUrl, {
  //   importBaseURL
  // });
  // let malloyModel: Model = await malloyModelMaterializer.getModel();

  // let model2modelDef: ModelDef = malloyModel._modelDef;

  // let malloyModelInfo: ModelInfo = modelDefToModelInfo(model2modelDef);

  // console.log('malloyModelInfo');
  // console.log(malloyModelInfo);

  // let runtime2 = new Runtime({
  //   urlReader: {
  //     readURL: async (url: URL) => await fse.readFile(url, 'utf8')
  //   },
  //   connections: {
  //     lookupConnection: async function (name: string) {
  //       return malloyConnections.find(mc => mc.name === name);
  //     }
  //   }
  // });

  // fse.writeFileSync(
  //   'model-1.json',
  //   JSON.stringify(malloyModel, null, 2),
  //   'utf-8'
  // );

  // fse.writeFileSync(
  //   'model-def-1.json',
  //   JSON.stringify(malloyModel._modelDef, null, 2),
  //   'utf-8'
  // );

  // let materializer = runtime2._loadModelFromModelDef(malloyModel._modelDef);

  // console.log('materializer');
  // console.log(materializer);

  // let model2 = await materializer.getModel();

  let qStr = `run: ec1_m2 -> {
  group_by: users.state
  aggregate: orders.orders_count
  limit: 410
}`;

  let start10 = Date.now();

  // let qm: QueryMaterializer = materializer.loadQuery(qStr); // 0 ms
  // let qm: QueryMaterializer = runtime.loadQuery(qStr);

  // let k1 = malloyToQuery(qStr);
  // console.log('k1');
  // console.dir(k1, { depth: null });

  // let malloyEntryValueWithSource = malloyModelInfo.entries.find(
  //   y =>
  //     y.kind === 'source' && y.name === (k1.query.definition as any).source.name
  // ) as ModelEntryValueWithSource;

  // console.log('malloyEntryValueWithSource');
  // console.log(malloyEntryValueWithSource);

  // let qb0 = new ASTQuery({
  //   source: malloyEntryValueWithSource,
  //   query: k1.query
  // });

  // let mq = qb0.build();

  // console.log('mq');
  // console.log(mq);

  // let pq: PreparedQuery = await qm.getPreparedQuery();
  // let aSql = await qm.getSQL();

  console.log('diff10');
  console.log(Date.now() - start10);

  // console.log(pq);
  // console.log(aSql);

  // console.log('model2');
  // console.log(model2);

  // fse.writeFileSync('model-2.json', JSON.stringify(model2, null, 2), 'utf-8');

  // fse.writeFileSync(
  //   'model-def-2.json',
  //   JSON.stringify(model2._modelDef, null, 2),
  //   'utf-8'
  // );

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  // helper.log(
  //   cs,
  //   caller,
  //   func,
  //   structId,
  //   common.LogTypeEnum.MalloyModel,
  //   malloyModel
  // );

  return { malloyModel: malloyModel };
}

// // let explores: Explore[] = malloyModel.explores;
// // console.log('explores');
// // console.log(explores);

// // let namedQueries: NamedQuery[] = malloyModel.namedQueries;
// // console.log('namedQueries');
// // console.dir(namedQueries, { depth: null });

// // let ex: Explore = malloyModel.getExploreByName('ec1_m2');
// // console.log('ex');
// // console.log(ex);

// // let eq: PreparedQuery = ex.getQueryByName('query_orders_count_by_users_state');

// // console.log('eq');
// // console.log(eq);

// // let sk = eq.getPreparedResult();

// // console.log('sk');
// // console.log(sk);

// // let qb05 = new ASTQuery({
// //   // source: sk.,
// //   query: sk.query
// // });

// // let modelX: Model= malloyModel.explores[0].getSingleExploreModel();

// // let malloyModelDef: ModelDef = malloyModel._modelDef;

// // console.log('malloyModelDef');
// // console.dir(malloyModelDef, { depth: null });

// // let malloyModelInfo: ModelInfo = modelDefToModelInfo(malloyModelDef);

// // console.log('malloyModelInfo');
// // console.dir(malloyModelInfo, { depth: null });

// let start1 = Date.now();

// let qStr = `run: ec1_m2 -> {
//   limit: 10
//   group_by: users.state
//   aggregate: orders.orders_count
// }`;

// // let qm: QueryMaterializer = malloyModelMaterializer.loadQuery(qStr); // 0 ms
// // let qm: QueryMaterializer = runtime.loadQuery(qStr);

// console.log('diff1');
// console.log(Date.now() - start1);

// // console.log('qm');
// // console.dir(qm, { depth: null });

// // let qSql = await qm.getSQL(); // 11 ms

// // console.log('qSql');
// // console.log(qSql);

// // let r: Result = await qm.run();
// // console.log('r._queryResult.result');
// // console.log(r._queryResult.result);
// // console.log('r.toJSON');
// // console.log(r.toJSON());

// // let qPreparedQuery: PreparedQuery = await qm.getPreparedQuery();
// // console.log('qPreparedQuery');
// // console.dir(qPreparedQuery, { depth: null });

// // let qPreparedResult: PreparedResult = await qm.getPreparedResult();
// // let qSql = qPreparedResult.sql;

// // console.log('qPreparedResult');
// // console.dir(qPreparedResult, { depth: null });

// async function alt(x: common.FileMod) {
//   let queryModel: Model = await Malloy.compile({
//     urlReader: runtime.urlReader,
//     connections: runtime.connections,
//     model: malloyModel,
//     parse: Malloy.parse({ source: qStr })
//   });

//   let modelDef = queryModel._modelDef;

//   let modelInfo: ModelInfo = modelDefToModelInfo(modelDef);

//   let queryPreparedQuery = queryModel.preparedQuery;

//   let source = modelInfo.entries.find(
//     entry => entry.kind === 'source' && entry.name === 'ec1_m2'
//   );
// }

//     connectionModelItem = {
//       location: x.location,
//       connectionId: x.connection.connectionId,
//       malloyModel: malloyModel,
//       malloyModelMaterializer: malloyModelMaterializer,
//       malloyModelDef: malloyModelDef,
//       malloyModelInfo: malloyModelInfo
//     };
//     malloyItems.push(connectionModelItem);
//     // console.log('malloyModel');
//     // console.dir(malloyModel, { depth: null });
//     // console.log('malloyModelMaterializer');
//     // console.log(malloyModelMaterializer);
//   }
//   x.malloyEntryValueWithSource =
//     connectionModelItem.malloyModelInfo.entries.find(
//       y => y.kind === 'source' && y.name === x.source
//     ) as ModelEntryValueWithSource;
//   let k1 = malloyToQuery(qStr);
//   console.log('k1');
//   console.dir(k1, { depth: null });
//   let qb0 = new ASTQuery({
//     source: x.malloyEntryValueWithSource,
//     query: k1.query
//   });
//   let malloyStr0 = qb0.toMalloy();
//   console.log('malloyStr0');
//   console.dir(malloyStr0, { depth: null });
//   let segment0: ASTSegmentViewDefinition = qb0.getOrAddDefaultSegment();
//   segment0.addWhere('state', ['users'], 'WN, AA');
//   let malloyStr01 = qb0.toMalloy();
//   console.log('malloyStr01');
//   console.dir(malloyStr01, { depth: null });
//   let qb = new ASTQuery({
//     source: x.malloyEntryValueWithSource,
//     query: undefined
//   });
//   // console.log('qb');
//   // console.dir(qb, { depth: null });
//   //
//   // 1
//   //
//   let malloyStr1 = qb.toMalloy();
//   console.log('malloyStr1');
//   console.dir(malloyStr1, { depth: null });
//   // let query: Query = qb.build();
//   // console.log('query');
//   // console.dir(query, { depth: null });
//   //
//   // 2
//   //
//   let segment: ASTSegmentViewDefinition = qb.getOrAddDefaultSegment();
//   segment.addGroupBy('state', ['users']);
//   segment.addAggregate('orders_count');
//   segment.addAggregate('users_count', ['users']);
//   segment.addWhere('state', ['users'], 'WN, AA');
//   // console.log('segment');
//   // console.dir(segment, { depth: null });
//   let malloyStr2 = qb.toMalloy();
//   console.log('malloyStr2');
//   console.dir(malloyStr2, { depth: null });
//   // 3
//   // export type ASTViewOperation = ASTGroupByViewOperation | ASTAggregateViewOperation | ASTOrderByViewOperation | ASTNestViewOperation | ASTLimitViewOperation | ASTWhereViewOperation | ASTHavingViewOperation;
//   // 'group_by' | 'aggregate' | 'order_by' | 'limit' | 'where' | 'nest' | 'having';
//   segment.operations.items
//     .filter(
//       (operation: ASTViewOperation) =>
//         operation instanceof ASTAggregateViewOperation
//     )
//     .find(y => y.field.name === 'users_count')
//     .delete();
//   let malloyStr3 = qb.toMalloy();
//   console.log('malloyStr3');
//   console.dir(malloyStr3, { depth: null });
