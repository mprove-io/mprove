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
  ASTHavingViewOperation,
  ASTLimitViewOperation,
  ASTOrderByViewOperation,
  ASTQuery,
  ASTSegmentViewDefinition,
  ASTViewOperation,
  ASTWhereViewOperation
} from '@malloydata/malloy-query-builder';
import { FieldBase } from '@malloydata/malloy/dist/model';
import { Inject, Injectable } from '@nestjs/common';
import * as fse from 'fs-extra';
import { common } from '~backend/barrels/common';
import { nodeCommon } from '~backend/barrels/node-common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { getMalloyFiltersFractions } from '~node-common/functions/get-malloy-filters-fractions';
import { EnvsService } from './envs.service';

@Injectable()
export class MalloyService {
  constructor(
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async editMalloyQuery(item: {
    projectId: string;
    envId: string;
    structId: string;
    model: common.Model;
    mconfig: common.Mconfig;
    queryOperations: common.QueryOperation[];
  }) {
    let { projectId, envId, structId, model, mconfig, queryOperations } = item;

    let startEditMalloyQuery = Date.now();

    let isError = false;
    let errorMessage: string;

    let { apiEnv, connectionsWithFallback } =
      await this.envsService.getApiEnvConnectionsWithFallback({
        projectId: projectId,
        envId: envId
      });

    let connection = connectionsWithFallback.find(
      x => x.connectionId === model.connectionId
    );

    if (
      queryOperations.length === 1 &&
      ((queryOperations[0].type === common.QueryOperationTypeEnum.Get &&
        common.isUndefined(mconfig.malloyQuery)) ||
        (queryOperations[0].type === common.QueryOperationTypeEnum.Remove &&
          mconfig.select?.length === 1))
    ) {
      let { blankMconfig, blankQuery } = this.getBlankMconfigQuery({
        projectId: projectId,
        envId: envId,
        structId: structId,
        model: model,
        mconfig: mconfig,
        connection: connection
      });

      return { isError: false, newMconfig: blankMconfig, newQuery: blankQuery };
    }

    let malloyConnections = nodeCommon.makeMalloyConnections({
      connections: connectionsWithFallback
    });

    // console.log('modelDefToModelInfo');
    // let startModelDefToModelInfo = Date.now();
    let malloyModelInfo: MalloyModelInfo = modelDefToModelInfo(
      model.malloyModelDef
    );
    // console.log(Date.now() - startModelDefToModelInfo);

    let malloyToQueryResult = common.isDefined(mconfig.malloyQuery)
      ? malloyToQuery(mconfig.malloyQuery)
      : undefined;

    let logs: LogMessage[] = malloyToQueryResult?.logs;
    let q1: MalloyQuery = malloyToQueryResult?.query;

    // fse.writeFileSync(
    //   'malloy-query.json',
    //   JSON.stringify(q1, null, 2),
    //   'utf-8'
    // );

    let malloyEntryValueWithSource = malloyModelInfo.entries.find(
      y => y.kind === 'source' && y.name === model.modelId
    ) as ModelEntryValueWithSource;

    let astQuery: ASTQuery = new ASTQuery({
      source: malloyEntryValueWithSource,
      query: q1
    });

    let segment0: ASTSegmentViewDefinition = astQuery.getOrAddDefaultSegment();

    // console.log('segment0');
    // console.dir(segment0, { depth: null });

    queryOperations.forEach(queryOperation => {
      if (
        [
          common.QueryOperationTypeEnum.GroupOrAggregate,
          common.QueryOperationTypeEnum.GroupOrAggregatePlusSort
        ].indexOf(queryOperation.type) > -1
      ) {
        if (common.isUndefined(queryOperation.fieldId)) {
          isError = true;
          errorMessage = `queryOperation.fieldId is not defined (QueryOperationTypeEnum.Select)`;
        }

        let modelField = model.fields.find(
          x => x.id === queryOperation.fieldId
        );

        if (common.isUndefined(modelField)) {
          isError = true;
          errorMessage = `modelField is not defined (queryOperation.fieldId: ${queryOperation.fieldId})`;
        }

        // console.log('modelField');
        // console.log(modelField);

        let fieldName = modelField.malloyFieldName;
        let fieldPath: string[] = modelField.malloyFieldPath;
        let fieldRename = modelField.sqlName;

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
            if (fieldPath.length > 0) {
              segment0.addAggregate(fieldName, fieldPath, fieldRename);
            } else {
              segment0.addAggregate(fieldName);
            }
          } else if (
            modelField.fieldClass === common.FieldClassEnum.Dimension
          ) {
            if (fieldPath.length > 0) {
              segment0.addGroupBy(fieldName, fieldPath, fieldRename);
            } else {
              segment0.addGroupBy(fieldName);
            }
          }
        } else {
          if (modelField.fieldClass === common.FieldClassEnum.Measure) {
            // deselect aggregate
            segment0.operations.items
              .filter(
                (operation: ASTViewOperation) =>
                  operation instanceof ASTAggregateViewOperation
              )
              .find(item => {
                let exp = item.field.node
                  .expression as ExpressionWithFieldReference;

                let fieldId = common.isDefined(exp.path)
                  ? [...exp.path, exp.name].join('.')
                  : exp.name;

                return fieldId === queryOperation.fieldId;
              })
              .delete();
          } else if (
            modelField.fieldClass === common.FieldClassEnum.Dimension
          ) {
            // deselect groupBy
            segment0.operations.items
              .filter(
                (operation: ASTViewOperation) =>
                  operation instanceof ASTGroupByViewOperation
              )
              .find(item => {
                let exp = item.field.node
                  .expression as ExpressionWithFieldReference;

                let fieldId = common.isDefined(exp.path)
                  ? [...exp.path, exp.name].join('.')
                  : exp.name;

                return fieldId === queryOperation.fieldId;
              })
              .delete();
          }
        }
      } else if (
        queryOperation.type === common.QueryOperationTypeEnum.WhereOrHaving
      ) {
        if (common.isUndefined(queryOperation.fieldId)) {
          isError = true;
          errorMessage = `queryOperation.fieldId is not defined (QueryOperationTypeEnum.Remove)`;
        }

        let modelField = model.fields.find(
          x => x.id === queryOperation.fieldId
        );

        if (common.isUndefined(modelField)) {
          isError = true;
          errorMessage = `modelField is not defined (queryOperation.fieldId: ${queryOperation.fieldId})`;
        }

        segment0.operations.items
          .filter(
            (operation: ASTViewOperation) =>
              operation instanceof ASTWhereViewOperation ||
              operation instanceof ASTHavingViewOperation
          )
          .forEach(item => {
            item.delete();
          });

        queryOperation.filters.forEach(filter => {
          let anyValues = filter.fractions.filter(
            fraction => fraction.brick === MALLOY_FILTER_ANY
          );

          let booleanValues = filter.fractions.filter(
            fraction =>
              [
                common.FractionTypeEnum.BooleanIsTrue,
                common.FractionTypeEnum.BooleanIsFalse,
                common.FractionTypeEnum.BooleanIsFalseOrNull,
                common.FractionTypeEnum.BooleanIsNull,
                common.FractionTypeEnum.BooleanIsNotTrue,
                common.FractionTypeEnum.BooleanIsNotFalse,
                common.FractionTypeEnum.BooleanIsNotFalseOrNull,
                common.FractionTypeEnum.BooleanIsNotNull
              ].indexOf(fraction.type) > -1
          );

          let ORs = filter.fractions.filter(
            fraction =>
              fraction.operator === common.FractionOperatorEnum.Or &&
              fraction.brick !== MALLOY_FILTER_ANY &&
              [
                common.FractionTypeEnum.BooleanIsTrue,
                common.FractionTypeEnum.BooleanIsFalse,
                common.FractionTypeEnum.BooleanIsFalseOrNull,
                common.FractionTypeEnum.BooleanIsNull,
                common.FractionTypeEnum.BooleanIsNotTrue,
                common.FractionTypeEnum.BooleanIsNotFalse,
                common.FractionTypeEnum.BooleanIsNotFalseOrNull,
                common.FractionTypeEnum.BooleanIsNotNull
              ].indexOf(fraction.type) < 0
          );

          let ANDs = filter.fractions.filter(
            fraction =>
              fraction.operator === common.FractionOperatorEnum.And &&
              fraction.brick !== MALLOY_FILTER_ANY &&
              [
                common.FractionTypeEnum.BooleanIsTrue,
                common.FractionTypeEnum.BooleanIsFalse,
                common.FractionTypeEnum.BooleanIsFalseOrNull,
                common.FractionTypeEnum.BooleanIsNull,
                common.FractionTypeEnum.BooleanIsNotTrue,
                common.FractionTypeEnum.BooleanIsNotFalse,
                common.FractionTypeEnum.BooleanIsNotFalseOrNull,
                common.FractionTypeEnum.BooleanIsNotNull
              ].indexOf(fraction.type) < 0
          );

          let filterModelField = model.fields.find(
            x => x.id === filter.fieldId
          );

          let filterFieldName = filterModelField.malloyFieldName;
          let filterFieldPath: string[] = filterModelField.malloyFieldPath;

          if (ORs.length > 0) {
            let fstrORs =
              filterModelField.result === common.FieldResultEnum.String
                ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(', ')
                : filterModelField.result === common.FieldResultEnum.Number
                  ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(
                      ' or '
                    )
                  : // : filterModelField.result === common.FieldResultEnum.Boolean
                    //   ? ORs.map(y => y.brick.slice(2, -1)).join(' or ')
                    filterModelField.result === common.FieldResultEnum.Ts
                    ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(
                        ' or '
                      )
                    : filterModelField.result === common.FieldResultEnum.Date
                      ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(
                          ' or '
                        )
                      : undefined;

            if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
              segment0.addWhere(filterFieldName, filterFieldPath, fstrORs);
            } else {
              segment0.addHaving(filterFieldName, filterFieldPath, fstrORs);
            }
          }

          if (ANDs.length > 0) {
            let fstrANDs =
              filterModelField.result === common.FieldResultEnum.String
                ? ANDs.map(y => y.brick.slice(2, -1)).join(', ')
                : filterModelField.result === common.FieldResultEnum.Number
                  ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
                  : // : filterModelField.result === common.FieldResultEnum.Boolean
                    //   ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
                    filterModelField.result === common.FieldResultEnum.Ts
                    ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
                    : filterModelField.result === common.FieldResultEnum.Date
                      ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
                      : undefined;

            if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
              segment0.addWhere(filterFieldName, filterFieldPath, fstrANDs);
            } else {
              segment0.addHaving(filterFieldName, filterFieldPath, fstrANDs);
            }
          }

          if (booleanValues.length > 0) {
            booleanValues.forEach(x => {
              let fstrAny = x.brick.slice(2, -1);

              if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
                segment0.addWhere(filterFieldName, filterFieldPath, fstrAny);
              } else {
                segment0.addHaving(filterFieldName, filterFieldPath, fstrAny);
              }
            });
          }

          if (anyValues.length > 0) {
            anyValues.forEach(x => {
              let fstrAny = '';

              if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
                segment0.addWhere(filterFieldName, filterFieldPath, fstrAny);
              } else {
                segment0.addHaving(filterFieldName, filterFieldPath, fstrAny);
              }
            });
          }
        });

        let { filtersFractions, parsedFilters } = getMalloyFiltersFractions({
          segment: segment0,
          apiModel: model
        });

        let filters: common.Filter[] = [];

        Object.keys(filtersFractions).forEach(fieldId => {
          filters.push({
            fieldId: fieldId,
            fractions: filtersFractions[fieldId] || []
          });
        });

        mconfig.filters = filters.sort((a, b) =>
          a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
        );
      } else if (queryOperation.type === common.QueryOperationTypeEnum.Remove) {
        if (common.isUndefined(queryOperation.fieldId)) {
          isError = true;
          errorMessage = `queryOperation.fieldId is not defined (QueryOperationTypeEnum.Remove)`;
        }

        let modelField = model.fields.find(
          x => x.id === queryOperation.fieldId
        );

        if (common.isUndefined(modelField)) {
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
            let exp = item.field.node
              .expression as ExpressionWithFieldReference;

            let fieldId = common.isDefined(exp.path)
              ? [...exp.path, exp.name].join('.')
              : exp.name;

            return fieldId === queryOperation.fieldId;
          })
          .delete();
      } else if (
        queryOperation.type === common.QueryOperationTypeEnum.Replace
      ) {
        if (common.isUndefined(queryOperation.fieldId)) {
          isError = true;
          errorMessage = `queryOperation.fieldId is not defined (QueryOperationTypeEnum.Replace)`;
        }

        if (common.isUndefined(queryOperation.replaceWithFieldId)) {
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
            let exp = item.field.node
              .expression as ExpressionWithFieldReference;

            let fieldId = common.isDefined(exp.path)
              ? [...exp.path, exp.name].join('.')
              : exp.name;

            return fieldId === queryOperation.fieldId;
          })
          .delete();

        if (
          replaceWithModelField.fieldClass === common.FieldClassEnum.Measure
        ) {
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
          replaceWithModelField.fieldClass === common.FieldClassEnum.Dimension
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
          mconfigSelectCopy.map(x =>
            x.split('.').join(common.DOUBLE_UNDERSCORE)
          )
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
            .join(common.DOUBLE_UNDERSCORE);

          segment0.addOrderBy(
            fieldNameUnderscore,
            sorting.desc === true ? 'desc' : 'asc'
          );
        });
      } else if (queryOperation.type === common.QueryOperationTypeEnum.Move) {
        segment0.reorderFields(
          queryOperation.moveFieldIds.map(x =>
            x.split('.').join(common.DOUBLE_UNDERSCORE)
          )
        );
      } else if (queryOperation.type === common.QueryOperationTypeEnum.Limit) {
        segment0.setLimit(queryOperation.limit);
      }

      // not else
      if (
        [
          common.QueryOperationTypeEnum.GroupOrAggregatePlusSort,
          common.QueryOperationTypeEnum.Remove,
          common.QueryOperationTypeEnum.Sort
        ].indexOf(queryOperation.type) > -1 &&
        common.isDefined(queryOperation.sortFieldId)
      ) {
        let fieldNameUnderscore = queryOperation.sortFieldId
          .split('.')
          .join(common.DOUBLE_UNDERSCORE);

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

      if (common.isUndefined(limitOp) || limitOp.limit > 500) {
        segment0.setLimit(500);
      }
    });

    // export type ASTViewOperation = ASTGroupByViewOperation | ASTAggregateViewOperation | ASTOrderByViewOperation | ASTNestViewOperation | ASTLimitViewOperation | ASTWhereViewOperation | ASTHavingViewOperation;
    // 'group_by' | 'aggregate' | 'order_by' | 'limit' | 'where' | 'nest' | 'having';
    // segment0.addWhere('state', ['users'], 'WN, AA');

    let newMalloyQuery = astQuery.toMalloy();

    console.log('newMalloyQuery');
    console.log(Date.now());
    console.log(newMalloyQuery);

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

    // console.log('_loadModelFromModelDef');
    // let startLoadModelFromModelDef = Date.now();
    let mm: ModelMaterializer = runtime._loadModelFromModelDef(
      model.malloyModelDef
    );
    // console.log(Date.now() - startLoadModelFromModelDef);

    // let malloyModel = await mm.getModel();

    // let queryMalloyModel: MalloyModel = await Malloy.compile({
    //   urlReader: runtime.urlReader,
    //   connections: runtime.connections,
    //   model: malloyModel,
    //   parse: Malloy.parse({ source: mconfig.malloyQuery })
    // });

    let qm: QueryMaterializer = mm.loadQuery(newMalloyQuery); // 0 ms

    // console.log('await qm.getPreparedQuery()');
    // let startGetPreparedQuery = Date.now();
    let pq: PreparedQuery = await qm.getPreparedQuery();
    // console.log(Date.now() - startGetPreparedQuery);

    // console.log('pq.getPreparedResult()');
    // let startGetPreparedResult = Date.now();
    let pr: PreparedResult = pq.getPreparedResult();
    // console.log(Date.now() - startGetPreparedResult);

    //

    let queryId = nodeCommon.makeQueryId({
      projectId: projectId,
      envId: envId,
      connectionId: model.connectionId,
      sql: pr.sql,
      store: undefined,
      storeTransformedRequestString: undefined
    });

    let newQuery: common.Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: connection.connectionId,
      connectionType: connection.type,
      sql: pr.sql,
      apiMethod: undefined,
      apiUrl: undefined,
      apiBody: undefined,
      status: common.QueryStatusEnum.New,
      lastRunBy: undefined,
      lastRunTs: undefined,
      lastCancelTs: undefined,
      lastCompleteTs: undefined,
      lastCompleteDuration: undefined,
      lastErrorMessage: errorMessage,
      lastErrorTs: (isError as boolean) === true ? makeTsNumber() : undefined,
      data: undefined,
      queryJobId: undefined,
      bigqueryQueryJobId: undefined,
      bigqueryConsecutiveErrorsGetJob: 0,
      bigqueryConsecutiveErrorsGetResults: 0,
      serverTs: 1
    };

    let compiledQuerySelect: string[] = [];

    let compiledQuery = pr._rawQuery;

    if (common.isDefined(compiledQuery)) {
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

        let sorting: common.Sorting;

        if (common.isDefined(field)) {
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
      .filter(sorting => common.isDefined(sorting));

    let newSorts: string[] = [];

    sortings.forEach(sorting =>
      sorting.desc
        ? newSorts.push(`${sorting.fieldId} desc`)
        : newSorts.push(sorting.fieldId)
    );

    let newMconfig: common.Mconfig = {
      structId: structId,
      mconfigId: common.makeId(),
      queryId: queryId,
      modelId: model.modelId,
      modelType: model.type,
      dateRangeIncludesRightSide: false,
      storePart: undefined,
      modelLabel: model.label,
      modelFilePath: model.filePath,
      malloyQuery: newMalloyQuery,
      compiledQuery: compiledQuery,
      select: compiledQuerySelect,
      unsafeSelect: [],
      warnSelect: [],
      joinAggregations: [],
      sortings: sortings,
      sorts: newSorts.length > 0 ? newSorts.join(', ') : null,
      timezone: queryOperations[0].timezone,
      limit: compiledQuery.structs[0].resultMetadata.limit,
      filters: mconfig.filters,
      chart: mconfig.chart, // previous mconfig chart
      temp: false,
      serverTs: 1
    };

    if (
      queryOperations.filter(
        queryOperation =>
          [
            common.QueryOperationTypeEnum.GroupOrAggregate,
            common.QueryOperationTypeEnum.GroupOrAggregatePlusSort,
            common.QueryOperationTypeEnum.Replace,
            common.QueryOperationTypeEnum.Remove
          ].indexOf(queryOperation.type) > -1
      ).length > 0
    ) {
      newMconfig = common.setChartTitleOnSelectChange({
        mconfig: newMconfig,
        fields: model.fields
      });
    }

    if (
      queryOperations.length === 1 &&
      [common.QueryOperationTypeEnum.Replace].indexOf(queryOperations[0].type) >
        -1
    ) {
      let replaceWithModelField = model.fields.find(
        x => x.id === queryOperations[0].replaceWithFieldId
      );

      newMconfig = common.replaceChartField({
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
            common.QueryOperationTypeEnum.GroupOrAggregate,
            common.QueryOperationTypeEnum.GroupOrAggregatePlusSort,
            common.QueryOperationTypeEnum.Replace,
            common.QueryOperationTypeEnum.Remove
          ].indexOf(queryOperation.type) > -1
      ).length > 0
    ) {
      newMconfig = common.setChartFields({
        mconfig: newMconfig,
        fields: model.fields
      });
    }

    console.log('editMalloyQuery:');
    console.log(Date.now() - startEditMalloyQuery);

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }

  getBlankMconfigQuery(item: {
    projectId: string;
    envId: string;
    structId: string;
    model: common.Model;
    mconfig: common.Mconfig;
    connection: common.ProjectConnection;
  }) {
    let { projectId, envId, structId, model, mconfig, connection } = item;

    let queryId = nodeCommon.makeQueryId({
      projectId: projectId,
      envId: envId,
      connectionId: model.connectionId,
      sql: '',
      store: undefined,
      storeTransformedRequestString: undefined
    });

    let blankQuery: common.Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: model.connectionId,
      connectionType: connection.type,
      sql: undefined,
      apiMethod: undefined,
      apiUrl: undefined,
      apiBody: undefined,
      status: common.QueryStatusEnum.New,
      data: [],
      lastRunBy: undefined,
      lastRunTs: 1,
      lastCancelTs: 1,
      lastCompleteTs: 1,
      lastCompleteDuration: undefined,
      lastErrorMessage: undefined,
      lastErrorTs: 1,
      queryJobId: undefined,
      bigqueryQueryJobId: undefined,
      bigqueryConsecutiveErrorsGetJob: undefined,
      bigqueryConsecutiveErrorsGetResults: undefined,
      serverTs: 1
    };

    let blankMconfig: common.Mconfig = {
      structId: structId,
      mconfigId: common.makeId(),
      queryId: queryId,
      modelId: model.modelId,
      modelType: model.type,
      dateRangeIncludesRightSide: false,
      storePart: undefined,
      modelLabel: model.label,
      modelFilePath: model.filePath,
      malloyQuery: undefined,
      compiledQuery: undefined,
      select: [],
      unsafeSelect: [],
      warnSelect: [],
      joinAggregations: [],
      sortings: [],
      sorts: null,
      timezone: mconfig.timezone,
      limit: 500,
      filters: [],
      chart: common.makeCopy(common.DEFAULT_CHART),
      temp: false,
      serverTs: 1
    };

    return { blankMconfig: blankMconfig, blankQuery: blankQuery };
  }
}
