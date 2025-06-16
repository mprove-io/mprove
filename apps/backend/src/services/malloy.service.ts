import {
  LogMessage,
  ModelInfo as MalloyModelInfo,
  Query as MalloyQuery,
  ModelEntryValueWithSource
} from '@malloydata/malloy-interfaces';
import {
  ASTAggregateViewOperation,
  ASTGroupByViewOperation,
  ASTQuery,
  ASTSegmentViewDefinition,
  ASTViewOperation
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
import { nodeCommon } from '~backend/barrels/node-common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { EnvsService } from './envs.service';

@Injectable()
export class MalloyService {
  constructor(
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async createMalloyQuery(item: {
    projectId: string;
    envId: string;
    model: common.Model;
    mconfig: common.Mconfig;
    queryOperation: common.QueryOperation;
  }) {
    let { projectId, envId, model, mconfig, queryOperation } = item;

    let newMconfig: common.Mconfig;
    let newQuery: common.Query;

    let isError = false;
    let errorMessage: string;

    let { apiEnv, connectionsWithFallback } =
      await this.envsService.getApiEnvConnectionsWithFallback({
        projectId: projectId,
        envId: envId
      });

    let malloyConnections = nodeCommon.makeMalloyConnections({
      connections: connectionsWithFallback
    });

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

    console.log('segment0');
    console.dir(segment0, { depth: null });

    if (queryOperation.type === common.QueryOperationTypeEnum.Select) {
      if (common.isUndefined(queryOperation.fieldId)) {
        isError = true;
        errorMessage = `queryOperation.fieldId is not defined (QueryOperationTypeEnum.Select)`;
      }

      let modelField = model.fields.find(x => x.id === queryOperation.fieldId);

      let fieldPath: string[] = queryOperation.fieldId.split('.');

      let fieldName = fieldPath.pop();

      if (common.isUndefined(modelField)) {
        isError = true;
        errorMessage = `modelField is not defined (queryOperation.fieldId: ${queryOperation.fieldId})`;
      }

      if (
        [
          common.FieldClassEnum.Measure,
          common.FieldClassEnum.Dimension
        ].indexOf(modelField.fieldClass) < 0
      ) {
        isError = true;
        errorMessage = `wrong modelField.fieldClass`;
      }

      let selectIndex = mconfig.select.findIndex(
        x => x === queryOperation.fieldId
      );

      if (selectIndex < 0) {
        if (modelField.fieldClass === common.FieldClassEnum.Measure) {
          segment0.addAggregate(fieldName, fieldPath);
        } else if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
          segment0.addGroupBy(fieldName, fieldPath);
        }
      } else {
        if (modelField.fieldClass === common.FieldClassEnum.Measure) {
          // deselect aggregate
          segment0.operations.items
            .filter(
              (operation: ASTViewOperation) =>
                operation instanceof ASTAggregateViewOperation
            )
            .find(y => y.field.name === fieldName)
            .delete();
        } else if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
          // deselect groupBy
          segment0.operations.items
            .filter(
              (operation: ASTViewOperation) =>
                operation instanceof ASTGroupByViewOperation
            )
            .find(y => y.field.name === fieldName)
            .delete();
        }
      }
    }

    // export type ASTViewOperation = ASTGroupByViewOperation | ASTAggregateViewOperation | ASTOrderByViewOperation | ASTNestViewOperation | ASTLimitViewOperation | ASTWhereViewOperation | ASTHavingViewOperation;
    // 'group_by' | 'aggregate' | 'order_by' | 'limit' | 'where' | 'nest' | 'having';
    // segment0.addWhere('state', ['users'], 'WN, AA');

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

    // let queryId = nodeCommon.makeQueryId({
    //   projectId: project.projectId,
    //   envId: envId,
    //   connectionId: model.connectionId,
    //   sql: undefined, // isStore true
    //   store: model.content as common.FileStore,
    //   storeTransformedRequestString: processedRequest.result
    // });

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }
}
