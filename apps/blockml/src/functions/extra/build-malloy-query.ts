import { PostgresConnection } from '@malloydata/db-postgres';
import {
  ModelMaterializer,
  PreparedQuery,
  PreparedResult,
  QueryMaterializer,
  Runtime,
  malloyToQuery
} from '@malloydata/malloy';
import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import {
  LogMessage,
  Query as MalloyQuery,
  ModelEntryValueWithSource
} from '@malloydata/malloy-interfaces';
import { ASTQuery } from '@malloydata/malloy-query-builder';
import { ASTSegmentViewDefinition } from '@malloydata/malloy-query-builder';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { FuncEnum } from '~common/enums/special/func.enum';
import { isDefined } from '~common/functions/is-defined';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { FilterBricksDictionary } from '~common/interfaces/blockml/filter-bricks-dictionary';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { Model } from '~common/interfaces/blockml/model';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { getMalloyFiltersFractions } from '~node-common/functions/get-malloy-filters-fractions';
import { processMalloyWhereOrHaving } from '~node-common/functions/process-malloy-where-or-having';

let func = FuncEnum.BuildMalloyQuery;

export async function buildMalloyQuery(
  item: {
    apiModel: Model;
    malloyConnections: PostgresConnection[];
    malloyModelDef: MalloyModelDef;
    malloyQuery: string;
    malloyEntryValueWithSource: ModelEntryValueWithSource;
    combinedFilters: FilterBricksDictionary;
    // errors: BmError[];
    // structId: string;
    // caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let {
    apiModel,
    malloyModelDef,
    malloyQuery,
    combinedFilters
    // errors,
    // structId,
    // caller,
  } = item;
  // log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let startLoadModel = Date.now();
  let runtime = new Runtime({
    urlReader: {
      readURL: async (url: URL) => await fse.readFile(url, 'utf8')
    },
    connections: {
      lookupConnection: async function (name: string) {
        return item.malloyConnections.find(mc => mc.name === name);
      }
    }
  });

  let mm: ModelMaterializer = runtime._loadModelFromModelDef(malloyModelDef);
  // console.log('LoadModel');
  // console.log(Date.now() - startLoadModel); // 0ms

  let startLoadQuery = Date.now();
  let qm: QueryMaterializer = mm.loadQuery(malloyQuery); // 0 ms
  // console.log('LoadQuery');
  // console.log(Date.now() - startLoadQuery); // 0ms

  // let startGetSQL = Date.now();
  // let aSql = await qm.getSQL();
  // console.log('GetSQL');
  // console.log(Date.now() - startGetSQL); // 14ms

  let startPrepareQuery = Date.now();
  let preparedQuery: PreparedQuery = await qm.getPreparedQuery();
  // console.log('PrepareQuery');
  // console.log(Date.now() - startPrepareQuery); // 15ms (47ms if many where)

  let startPrepareResult = Date.now();
  let preparedResult: PreparedResult = preparedQuery.getPreparedResult();
  // console.log('PrepareResult');
  // console.log(Date.now() - startPrepareResult); // 10ms

  let startMalloyToQuery = Date.now();
  let malloyToQueryResult = malloyToQuery(item.malloyQuery);
  // console.log('MalloyToQuery');
  // console.log(Date.now() - startMalloyToQuery); // 15ms

  let logs: LogMessage[] = malloyToQueryResult?.logs;
  let q1: MalloyQuery = malloyToQueryResult?.query;

  let startASTQuery = Date.now();
  let astQuery: ASTQuery = new ASTQuery({
    source: item.malloyEntryValueWithSource,
    query: q1
  });
  // console.log('ASTQuery');
  // console.log(Date.now() - startASTQuery); // 1 ms

  let startFractions = Date.now();

  let segment0: ASTSegmentViewDefinition = astQuery.getOrAddDefaultSegment();

  let { filtersFractions, parsedFilters } = getMalloyFiltersFractions({
    segment: segment0,
    apiModel: apiModel
  });

  let newMalloyQuery;

  if (isDefined(combinedFilters) && Object.keys(combinedFilters).length > 0) {
    let mFilters: { fieldId: string; fractions: Fraction[] }[] = [];

    let mFiltersBricks: FilterBricksDictionary = {};

    Object.keys(filtersFractions).forEach(fieldId => {
      mFiltersBricks[fieldId] = filtersFractions[fieldId].map(
        fraction => fraction.brick
      );
    });

    Object.keys(combinedFilters).forEach(fieldId => {
      mFiltersBricks[fieldId] = combinedFilters[fieldId];
    });

    Object.keys(mFiltersBricks).forEach(fieldId => {
      let modelField = apiModel.fields.find(x => x.id === fieldId);

      let fractions: Fraction[] = [];

      let pf = bricksToFractions({
        // caseSensitiveStringFilters: caseSensitiveStringFilters,
        filterBricks: mFiltersBricks[fieldId],
        result: modelField.result,
        isGetTimeRange: false,
        fractions: fractions
      });

      mFilters.push({
        fieldId: fieldId,
        fractions: fractions
      });

      let p = processMalloyWhereOrHaving({
        model: apiModel,
        segment0: segment0,
        queryOperationFilters: mFilters
      });

      let isError;
      let errorMessage;

      if (p.isError === true) {
        isError = p.isError; // TODO: check
        errorMessage = p.errorMessage;
      }

      filtersFractions = p.filtersFractions;
      parsedFilters = p.parsedFilters;
    });

    newMalloyQuery = astQuery.toMalloy();

    qm = mm.loadQuery(newMalloyQuery);

    preparedQuery = await qm.getPreparedQuery();

    preparedResult = preparedQuery.getPreparedResult();
  }

  // console.log('Fractions');
  // console.log(Date.now() - startFractions); // 3ms

  return {
    // astQuery: astQuery,
    // preparedQuery: preparedQuery,
    preparedResult: preparedResult,
    filtersFractions: filtersFractions,
    newMalloyQuery: newMalloyQuery
  };
}
