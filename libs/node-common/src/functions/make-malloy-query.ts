import {
  Runtime as MalloyRuntime,
  ModelMaterializer,
  PreparedQuery,
  PreparedResult,
  QueryMaterializer,
  malloyToQuery,
  modelDefToModelInfo
} from '@malloydata/malloy';
import {
  ExpressionWithFieldReference,
  LogMessage,
  ModelInfo as MalloyModelInfo,
  Query as MalloyQuery,
  ModelEntryValueWithSource
} from '@malloydata/malloy-interfaces';
import {
  ASTAggregateViewOperation,
  ASTGroupByViewOperation,
  ASTLimitViewOperation,
  ASTOrderByViewOperation,
  ASTQuery,
  ASTSegmentViewDefinition,
  ASTViewOperation
} from '@malloydata/malloy-query-builder';
import { FieldBase } from '@malloydata/malloy/dist/model';
import * as fse from 'fs-extra';
import { DOUBLE_UNDERSCORE } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { QueryOperationTypeEnum } from '~common/enums/query-operation-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { replaceChartField } from '~common/functions/replace-chart-field';
import { setChartFields } from '~common/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '~common/functions/set-chart-title-on-select-change';
import { QueryOperation } from '~common/interfaces/backend/query-operation';
import { Filter } from '~common/interfaces/blockml/filter';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { Query } from '~common/interfaces/blockml/query';
import { Sorting } from '~common/interfaces/blockml/sorting';
import { ServerError } from '~common/models/server-error';
import { getBlankMconfigAndQuery } from './get-blank-mconfig-and-query';
import { MalloyConnection } from './make-malloy-connections';
import { makeQueryId } from './make-query-id';
import { processMalloyWhereOrHaving } from './process-malloy-where-or-having';

export interface MalloyQueryResult {
  isError: boolean;
  errorMessage: string;
  apiNewMconfig: Mconfig;
  apiNewQuery: Query;
}

export async function makeMalloyQuery(item: {
  projectId: string;
  envId: string;
  structId: string;
  mconfigParentType: MconfigParentTypeEnum;
  mconfigParentId: string;
  model: Model;
  mconfig: Mconfig;
  queryOperations: QueryOperation[];
  malloyConnections: MalloyConnection[];
}) {
  let {
    projectId,
    envId,
    structId,
    mconfigParentType,
    mconfigParentId,
    model,
    mconfig,
    queryOperations,
    malloyConnections
  } = item;

  mconfig.parentType = mconfigParentType;
  mconfig.parentId = mconfigParentId;

  let isError = false;
  let errorMessage: string;

  if (
    queryOperations.length === 1 &&
    ((queryOperations[0].type === QueryOperationTypeEnum.Get &&
      isUndefined(mconfig.malloyQueryStable)) ||
      (queryOperations[0].type === QueryOperationTypeEnum.Remove &&
        mconfig.select?.length === 1))
  ) {
    let { blankMconfig, blankQuery } = getBlankMconfigAndQuery({
      projectId: projectId,
      envId: envId,
      structId: structId,
      model: model,
      mconfig: mconfig
    });

    let result: MalloyQueryResult = {
      isError: false,
      errorMessage: undefined,
      apiNewMconfig: blankMconfig,
      apiNewQuery: blankQuery
    };

    return result;
  }

  let malloyModelInfo: MalloyModelInfo = modelDefToModelInfo(
    model.malloyModelDef
  );

  let malloyToQueryResult = isDefined(mconfig.malloyQueryStable)
    ? malloyToQuery(mconfig.malloyQueryStable)
    : undefined;

  let malloyToQueryLogs: LogMessage[] = malloyToQueryResult?.logs;

  if (malloyToQueryLogs?.filter(x => x.severity === 'error').length > 0) {
    throw new ServerError({
      message: ErEnum.MALLOY_TO_QUERY_FAILED,
      customData: { malloyToQueryLogs: malloyToQueryLogs }
    });
  }

  let q1: MalloyQuery = malloyToQueryResult?.query;

  let malloyEntryValueWithSource = malloyModelInfo.entries.find(
    y => y.kind === 'source' && y.name === model.modelId
  ) as ModelEntryValueWithSource;

  let astQuery: ASTQuery = new ASTQuery({
    source: malloyEntryValueWithSource,
    query: q1
  });

  let segment0: ASTSegmentViewDefinition = astQuery.getOrAddDefaultSegment();

  queryOperations.forEach(queryOperation => {
    if (
      [
        QueryOperationTypeEnum.GroupOrAggregate,
        QueryOperationTypeEnum.GroupOrAggregatePlusSort
      ].indexOf(queryOperation.type) > -1
    ) {
      if (isUndefined(queryOperation.fieldId)) {
        isError = true;
        errorMessage = `queryOperation.fieldId is not defined (QueryOperationTypeEnum.Select)`;
      }

      let modelField = model.fields.find(x => x.id === queryOperation.fieldId);

      if (isUndefined(modelField)) {
        isError = true;
        errorMessage = `modelField is not defined (queryOperation.fieldId: ${queryOperation.fieldId})`;
      }

      let fieldName = modelField.malloyFieldName;
      let fieldPath: string[] = modelField.malloyFieldPath;
      let fieldRename = modelField.sqlName;

      if (
        [FieldClassEnum.Measure, FieldClassEnum.Dimension].indexOf(
          modelField.fieldClass
        ) < 0
      ) {
        isError = true;
        errorMessage = `wrong modelField.fieldClass`;
      }

      let selectIndex = mconfig.select.findIndex(
        x => x === queryOperation.fieldId
      );

      if (selectIndex < 0) {
        if (modelField.fieldClass === FieldClassEnum.Measure) {
          if (fieldPath.length > 0) {
            segment0.addAggregate(fieldName, fieldPath, fieldRename);
          } else {
            segment0.addAggregate(fieldName);
          }
        } else if (modelField.fieldClass === FieldClassEnum.Dimension) {
          if (fieldPath.length > 0) {
            segment0.addGroupBy(fieldName, fieldPath, fieldRename);
          } else {
            segment0.addGroupBy(fieldName);
          }
        }
      } else {
        if (modelField.fieldClass === FieldClassEnum.Measure) {
          // deselect aggregate
          segment0.operations.items
            .filter(
              (operation: ASTViewOperation) =>
                operation instanceof ASTAggregateViewOperation
            )
            .find(item => {
              let exp = item.field.node
                .expression as ExpressionWithFieldReference;

              let fieldId = isDefined(exp.path)
                ? [...exp.path, exp.name].join('.')
                : exp.name;

              return fieldId === queryOperation.fieldId;
            })
            .delete();
        } else if (modelField.fieldClass === FieldClassEnum.Dimension) {
          // deselect groupBy
          segment0.operations.items
            .filter(
              (operation: ASTViewOperation) =>
                operation instanceof ASTGroupByViewOperation
            )
            .find(item => {
              let exp = item.field.node
                .expression as ExpressionWithFieldReference;

              let fieldId = isDefined(exp.path)
                ? [...exp.path, exp.name].join('.')
                : exp.name;

              return fieldId === queryOperation.fieldId;
            })
            .delete();
        }
      }
    } else if (queryOperation.type === QueryOperationTypeEnum.WhereOrHaving) {
      let p = processMalloyWhereOrHaving({
        model: model,
        segment0: segment0,
        queryOperationFilters: queryOperation.filters
      });

      if (p.isError === true) {
        isError = p.isError;
        errorMessage = p.errorMessage;
      }

      let filtersFractions = p.filtersFractions;
      let parsedFilters = p.parsedFilters;

      let filters: Filter[] = [];

      Object.keys(filtersFractions).forEach(fieldId => {
        filters.push({
          fieldId: fieldId,
          fractions: filtersFractions[fieldId] || []
        });
      });

      mconfig.filters = filters.sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      );
    } else if (queryOperation.type === QueryOperationTypeEnum.Remove) {
      if (isUndefined(queryOperation.fieldId)) {
        isError = true;
        errorMessage = `queryOperation.fieldId is not defined (QueryOperationTypeEnum.Remove)`;
      }

      let modelField = model.fields.find(x => x.id === queryOperation.fieldId);

      if (isUndefined(modelField)) {
        isError = true;
        errorMessage = `modelField is not defined (queryOperation.fieldId: ${queryOperation.fieldId})`;
      }

      segment0.operations.items
        .filter(
          (operation: ASTViewOperation) =>
            operation instanceof ASTGroupByViewOperation ||
            operation instanceof ASTAggregateViewOperation
        )
        .find(item => {
          let exp = item.field.node.expression as ExpressionWithFieldReference;

          let fieldId = isDefined(exp.path)
            ? [...exp.path, exp.name].join('.')
            : exp.name;

          return fieldId === queryOperation.fieldId;
        })
        .delete();
    } else if (queryOperation.type === QueryOperationTypeEnum.Replace) {
      if (isUndefined(queryOperation.fieldId)) {
        isError = true;
        errorMessage = `queryOperation.fieldId is not defined (QueryOperationTypeEnum.Replace)`;
      }

      if (isUndefined(queryOperation.replaceWithFieldId)) {
        isError = true;
        errorMessage = `queryOperation.replaceWithFieldId is not defined (QueryOperationTypeEnum.Replace)`;
      }

      let replaceWithModelField = model.fields.find(
        x => x.id === queryOperation.replaceWithFieldId
      );

      let currentFieldFullPath: string[] = queryOperation.fieldId.split('.');

      let currentFieldPath: string[] = currentFieldFullPath.slice(0, -1);

      let currentFieldName =
        currentFieldFullPath[currentFieldFullPath.length - 1];

      //

      let replaceFieldPath = replaceWithModelField.malloyFieldPath;
      let replaceFieldName = replaceWithModelField.malloyFieldName;
      let replaceFieldRename = replaceWithModelField.sqlName;

      segment0.operations.items
        .filter(
          (operation: ASTViewOperation) =>
            operation instanceof ASTGroupByViewOperation ||
            operation instanceof ASTAggregateViewOperation
        )
        .find(item => {
          let exp = item.field.node.expression as ExpressionWithFieldReference;

          let fieldId = isDefined(exp.path)
            ? [...exp.path, exp.name].join('.')
            : exp.name;

          return fieldId === queryOperation.fieldId;
        })
        .delete();

      if (replaceWithModelField.fieldClass === FieldClassEnum.Measure) {
        if (currentFieldPath.length > 0) {
          segment0.addAggregate(
            replaceFieldName,
            replaceFieldPath,
            replaceFieldRename
          );
        } else {
          segment0.addAggregate(replaceFieldName);
        }
      } else if (
        replaceWithModelField.fieldClass === FieldClassEnum.Dimension
      ) {
        if (replaceFieldPath.length > 0) {
          segment0.addGroupBy(
            replaceFieldName,
            replaceFieldPath,
            replaceFieldRename
          );
        } else {
          segment0.addGroupBy(replaceFieldName);
        }
      }

      let mconfigSelectCopy = [...mconfig.select];
      let index = mconfigSelectCopy.indexOf(queryOperation.fieldId);
      mconfigSelectCopy.splice(index, 1, queryOperation.replaceWithFieldId);

      segment0.reorderFields(
        mconfigSelectCopy.map(x => x.split('.').join(DOUBLE_UNDERSCORE))
      );

      segment0.operations.items
        .filter(
          (operation: ASTViewOperation) =>
            operation instanceof ASTOrderByViewOperation
        )
        .forEach(op => op.delete());

      mconfig.sortings.forEach(sorting => {
        if (sorting.fieldId === queryOperation.fieldId) {
          sorting.fieldId = queryOperation.replaceWithFieldId;
        }
      });

      mconfig.sortings.forEach(sorting => {
        let fieldNameUnderscore = sorting.fieldId
          .split('.')
          .join(DOUBLE_UNDERSCORE);

        segment0.addOrderBy(
          fieldNameUnderscore,
          sorting.desc === true ? 'desc' : 'asc'
        );
      });
    } else if (queryOperation.type === QueryOperationTypeEnum.Move) {
      segment0.reorderFields(
        queryOperation.moveFieldIds.map(x =>
          x.split('.').join(DOUBLE_UNDERSCORE)
        )
      );
    } else if (queryOperation.type === QueryOperationTypeEnum.Limit) {
      segment0.setLimit(queryOperation.limit);
    }

    // not else
    if (
      [
        QueryOperationTypeEnum.GroupOrAggregatePlusSort,
        QueryOperationTypeEnum.Remove,
        QueryOperationTypeEnum.Sort
      ].indexOf(queryOperation.type) > -1 &&
      isDefined(queryOperation.sortFieldId)
    ) {
      let fieldNameUnderscore = queryOperation.sortFieldId
        .split('.')
        .join(DOUBLE_UNDERSCORE);

      let fIndex = mconfig.sortings.findIndex(
        sorting => sorting.fieldId === queryOperation.sortFieldId
      );

      let op = segment0.operations.items
        .filter(
          (operation: ASTViewOperation) =>
            operation instanceof ASTOrderByViewOperation
        )
        .find((orderByItem: ASTOrderByViewOperation) => {
          return orderByItem.name === fieldNameUnderscore;
        });

      if (
        fIndex > -1 &&
        mconfig.sortings[fIndex].desc === true &&
        queryOperation.desc
      ) {
        // desc should be removed from sortings and asc should be added to end
        op.delete();
        segment0.addOrderBy(fieldNameUnderscore, 'asc');
      } else if (
        fIndex > -1 &&
        mconfig.sortings[fIndex].desc === true &&
        !queryOperation.desc
      ) {
        // not possible in UI
        // asc should be removed from sorting
        op.delete();
      } else if (fIndex > -1 && mconfig.sortings[fIndex].desc === false) {
        // asc should be removed from sortings
        op.delete();
      } else if (fIndex < 0) {
        // should be added to sortings
        segment0.addOrderBy(
          fieldNameUnderscore,
          queryOperation.desc === true ? 'desc' : 'asc'
        );
      }
    }

    let limitOp = segment0.operations.items.find(
      operation => operation instanceof ASTLimitViewOperation
    );

    if (isUndefined(limitOp) || limitOp.limit > 500) {
      segment0.setLimit(500);
    }
  });

  // export type ASTViewOperation = ASTGroupByViewOperation | ASTAggregateViewOperation | ASTOrderByViewOperation | ASTNestViewOperation | ASTLimitViewOperation | ASTWhereViewOperation | ASTHavingViewOperation;
  // 'group_by' | 'aggregate' | 'order_by' | 'limit' | 'where' | 'nest' | 'having';
  // segment0.addWhere('state', ['users'], 'WN, AA');

  let newMalloyQueryStable = astQuery.toMalloy();

  let timezone =
    queryOperations.length > 0 &&
    queryOperations[0].type === QueryOperationTypeEnum.Get
      ? queryOperations[0].timezone
      : mconfig.timezone;

  let newMalloyQueryExtra =
    newMalloyQueryStable.slice(0, -1) +
    `  timezone: '${timezone}'
}`;

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

  let qm: QueryMaterializer = mm.loadQuery(newMalloyQueryExtra); // 0 ms

  let pq: PreparedQuery = await qm.getPreparedQuery();
  let pr: PreparedResult = pq.getPreparedResult();

  //

  let queryId = makeQueryId({
    projectId: projectId,
    envId: envId,
    connectionId: model.connectionId,
    mconfigParentType: mconfigParentType,
    mconfigParentId: mconfigParentId,
    sql: pr.sql,
    store: undefined,
    storeTransformedRequestString: undefined
  });

  let newQuery: Query = {
    queryId: queryId,
    projectId: projectId,
    envId: envId,
    connectionId: model.connectionId,
    connectionType: model.connectionType,
    reportId:
      mconfig.parentType === MconfigParentTypeEnum.Report
        ? mconfig.parentId
        : undefined,
    reportStructId:
      mconfig.parentType === MconfigParentTypeEnum.Report
        ? mconfig.structId
        : undefined,
    sql: pr.sql,
    apiMethod: undefined,
    apiUrl: undefined,
    apiBody: undefined,
    status:
      (isError as boolean) === true
        ? QueryStatusEnum.Error
        : QueryStatusEnum.New,
    lastRunBy: undefined,
    lastRunTs: undefined,
    lastCancelTs: undefined,
    lastCompleteTs: undefined,
    lastCompleteDuration: undefined,
    lastErrorMessage: errorMessage,
    lastErrorTs: (isError as boolean) === true ? 1 : undefined,
    data: undefined,
    queryJobId: undefined,
    bigqueryQueryJobId: undefined,
    bigqueryConsecutiveErrorsGetJob: 0,
    bigqueryConsecutiveErrorsGetResults: 0,
    serverTs: 1
  };

  let compiledQuerySelect: string[] = [];

  let compiledQuery = pr._rawQuery;

  if (isDefined(compiledQuery)) {
    compiledQuery.structs[0].fields.forEach(field => {
      let drillExpression = (field as FieldBase).resultMetadata
        ?.drillExpression;

      let fieldId =
        drillExpression?.kind === 'field_reference'
          ? drillExpression.path.length > 0
            ? drillExpression.path.join('.') + '.' + drillExpression.name
            : drillExpression.name
          : undefined;

      compiledQuerySelect.push(fieldId);
    });
  }

  let sortings = segment0.operations.items
    .filter(
      (operation: ASTViewOperation) =>
        operation instanceof ASTOrderByViewOperation
    )
    .map((orderByItem: ASTOrderByViewOperation) => {
      let field = compiledQuery.structs[0].fields.find(compiledQueryField => {
        return compiledQueryField.name === orderByItem.name;
      });

      let sorting: Sorting;

      if (isDefined(field)) {
        let mField = model.fields.find(f => {
          let drillExpression = (field as FieldBase).resultMetadata
            ?.drillExpression;

          let fieldId =
            drillExpression?.kind === 'field_reference'
              ? drillExpression.path.length > 0
                ? drillExpression.path.join('.') + '.' + drillExpression.name
                : drillExpression.name
              : undefined;

          return f.id === fieldId;
        });

        sorting = {
          fieldId: mField.id,
          desc: orderByItem.direction === 'desc'
        };
      }

      return sorting;
    })
    .filter(sorting => isDefined(sorting));

  let newSorts: string[] = [];

  sortings.forEach(sorting =>
    sorting.desc
      ? newSorts.push(`${sorting.fieldId} desc`)
      : newSorts.push(sorting.fieldId)
  );

  let newMconfig: Mconfig = {
    structId: structId,
    mconfigId: makeId(),
    queryId: queryId,
    modelId: model.modelId,
    modelType: model.type,
    parentType: mconfig.parentType,
    parentId: mconfig.parentId,
    dateRangeIncludesRightSide: false,
    storePart: undefined,
    modelLabel: model.label,
    modelFilePath: model.filePath,
    malloyQueryStable: newMalloyQueryStable,
    malloyQueryExtra: newMalloyQueryExtra,
    compiledQuery: compiledQuery,
    select: compiledQuerySelect,
    sortings: sortings,
    sorts: newSorts.length > 0 ? newSorts.join(', ') : null,
    timezone:
      queryOperations.length > 0
        ? queryOperations[0].timezone
        : mconfig.timezone,
    limit: compiledQuery.structs[0].resultMetadata.limit,
    filters: mconfig.filters,
    chart: mconfig.chart,
    serverTs: 1
  };

  if (
    queryOperations.filter(
      queryOperation =>
        [
          QueryOperationTypeEnum.GroupOrAggregate,
          QueryOperationTypeEnum.GroupOrAggregatePlusSort,
          QueryOperationTypeEnum.Replace,
          QueryOperationTypeEnum.Remove
        ].indexOf(queryOperation.type) > -1
    ).length > 0
  ) {
    newMconfig = setChartTitleOnSelectChange({
      mconfig: newMconfig,
      fields: model.fields
    });
  }

  if (
    queryOperations.length === 1 &&
    [QueryOperationTypeEnum.Replace].indexOf(queryOperations[0].type) > -1
  ) {
    let replaceWithModelField = model.fields.find(
      x => x.id === queryOperations[0].replaceWithFieldId
    );

    newMconfig = replaceChartField({
      mconfig: newMconfig,
      currentFieldId: queryOperations[0].fieldId,
      newColumnFieldId: queryOperations[0].replaceWithFieldId,
      newFieldResult: replaceWithModelField.result
    });
  }

  if (
    queryOperations.filter(
      queryOperation =>
        [
          QueryOperationTypeEnum.GroupOrAggregate,
          QueryOperationTypeEnum.GroupOrAggregatePlusSort,
          QueryOperationTypeEnum.Replace,
          QueryOperationTypeEnum.Remove
        ].indexOf(queryOperation.type) > -1
    ).length > 0
  ) {
    newMconfig = setChartFields({
      mconfig: newMconfig,
      fields: model.fields
    });
  }

  let result: MalloyQueryResult = {
    isError: isError,
    errorMessage: errorMessage,
    apiNewMconfig: newMconfig,
    apiNewQuery: newQuery
  };

  return result;
}
