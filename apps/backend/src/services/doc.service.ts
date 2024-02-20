import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { format, fromUnixTime } from 'date-fns';
import { forEachSeries } from 'p-iteration';
import * as pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { DbService } from './db.service';
import { RabbitService } from './rabbit.service';
import { UserCodeService } from './user-code.service';
let Graph = require('tarjan-graph');
let toposort = require('toposort');

interface XColumn {
  id: string;
  xDeps: string[];
  input: string;
  inputSub: string;
  outputValue: string;
  outputError: string;
}

@Injectable()
export class DocService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private rabbitService: RabbitService,
    private dbService: DbService,
    private userCodeService: UserCodeService
  ) {}

  async calculateParameters(item: {
    metrics: entities.MetricEntity[];
    models: entities.ModelEntity[];
    rows: common.Row[];
    traceId: string;
  }) {
    let { rows, models, metrics, traceId } = item;

    let xColumns: XColumn[] = [];

    rows
      .filter(row => row.rowType === common.RowTypeEnum.Formula)
      .forEach(row => {
        row.formulaError = undefined;
      });

    rows
      .filter(row => row.rowType === common.RowTypeEnum.Metric)
      .forEach(row => {
        let xColumnsRow: XColumn[] = [];

        if (
          common.isUndefined(row.parametersFormula) &&
          common.isDefined(row.parameters)
        ) {
          row.parameters
            .sort((a, b) =>
              a.filter > b.filter ? 1 : b.filter > a.filter ? -1 : 0
            )
            .forEach(parameter => {
              let columnX: XColumn;

              if (
                parameter.parameterType === common.ParameterTypeEnum.Formula
              ) {
                columnX = {
                  id: parameter.parameterId,
                  xDeps: parameter.xDeps,
                  input: parameter.formula,
                  inputSub: undefined,
                  outputValue: undefined,
                  outputError: undefined
                };
              } else {
                let prep = {
                  filter: parameter.filter,
                  conditions: parameter.conditions
                };

                columnX = {
                  id: parameter.parameterId,
                  xDeps: parameter.xDeps || [],
                  input: undefined,
                  inputSub: undefined,
                  outputValue: JSON.stringify(prep),
                  outputError: undefined
                };
              }
              xColumns.push(columnX);
              xColumnsRow.push(columnX);
            });
        }

        let parametersColumnX: XColumn = {
          id: `${row.rowId}_PARAMETERS`,
          xDeps: row.xDeps,
          input: common.isDefined(row.parametersFormula)
            ? row.parametersFormula
            : row.parameters.filter(
                x => x.parameterType === common.ParameterTypeEnum.Formula
              ).length > 0
            ? `return [${xColumnsRow.map(x => `$${x.id}`).join(', ')}]`
            : undefined,
          inputSub: undefined,
          outputValue:
            common.isDefined(row.parametersFormula) ||
            row.parameters.filter(
              x => x.parameterType === common.ParameterTypeEnum.Formula
            ).length > 0
              ? undefined
              : JSON.stringify(
                  row.parameters.map(x => {
                    let prep = {
                      filter: x.filter,
                      conditions: x.conditions
                    };
                    return prep;
                  })
                ),
          outputError: undefined
        };

        xColumns.push(parametersColumnX);
      });

    let xColumnsZeroDeps: string[] = [];

    // check for cycles - tarjan graph
    let g = new Graph();
    // graph for toposort
    let gr: string[][] = [];

    xColumns.forEach(xColumn => {
      if (common.isDefined(xColumn.xDeps) && xColumn.xDeps.length > 0) {
        xColumn.xDeps.forEach(xDep => {
          g.add(xColumn.id, [xDep]);
          gr.push([xColumn.id, xDep]);
        });
      } else {
        xColumnsZeroDeps.push(xColumn.id);
      }
    });

    let processedXColumns: XColumn[] = [];
    let cycledNames: string[] = [];

    if (g.hasCycle() === true) {
      let cycles: any[] = g.getCycles();

      cycledNames = cycles[0].map((c: any) => c.name);

      let cycledNamesStr = cycledNames.join(', ');

      processedXColumns = [
        ...xColumns
          .filter(k => cycledNames.indexOf(k.id) > -1)
          .map(x => {
            x.outputError = `Cycle in formula references of parameters: ${cycledNamesStr}`;
            return x;
          }),
        ...xColumns.filter(k => cycledNames.indexOf(k.id) < 0)
      ];
    } else {
      let xColumnsWithDeps = toposort(gr).reverse();

      let idsSorted = [
        ...xColumnsZeroDeps.filter(x => xColumnsWithDeps.indexOf(x) < 0),
        ...xColumnsWithDeps
      ];

      await forEachSeries(idsSorted, async x => {
        let xColumn = xColumns.find(y => y.id === x);

        if (common.isDefined(xColumn?.outputValue)) {
          processedXColumns.push(xColumn);
        } else if (common.isDefined(xColumn)) {
          let inputSub = xColumn.input;

          let reg = common.MyRegex.CAPTURE_X_REF();
          let r;

          let refError;

          while ((r = reg.exec(inputSub))) {
            let reference = r[1];

            let targetXColumn = processedXColumns.find(k => k.id === reference);

            if (common.isUndefined(targetXColumn)) {
              refError = `Reference ${reference} not found`;
              break;
            } else if (common.isDefined(targetXColumn.outputError)) {
              refError = `Referenced value of ${reference} has error`;
              break;
            }

            inputSub = common.MyRegex.replaceXRefs(
              inputSub,
              reference,
              targetXColumn.outputValue
            );
          }

          if (common.isDefined(refError)) {
            xColumn.outputValue = 'Error';
            xColumn.outputError = refError;
          } else {
            let userCode = `JSON.stringify((function() {
${inputSub}
})())`;

            let rs = await this.userCodeService.runOnly({
              userCode: userCode
            });

            xColumn.outputValue = rs.outValue || 'Error';
            xColumn.outputError = rs.outError;
          }

          processedXColumns.push(xColumn);
        }
      });
    }

    await forEachSeries(
      rows.filter(row => row.rowType === common.RowTypeEnum.Metric),
      async row => {
        let parametersXColumn = processedXColumns.find(
          x => x.id === `${row.rowId}_PARAMETERS`
        );

        let paramsSchemaError;
        let isParamsJsonValid = false;

        if (common.isUndefined(parametersXColumn.outputError)) {
          try {
            JSON.parse(parametersXColumn.outputValue);
            isParamsJsonValid = true;
          } catch (e) {
            isParamsJsonValid = false;
            paramsSchemaError = `Failed to calculate row parameters. 
Check parameters formula and its dependences. 
Formula must return a valid JSON (array of parameters).`;
          }
        } else {
          paramsSchemaError = parametersXColumn.outputError;
        }

        let parsedParameters: common.Parameter[] =
          isParamsJsonValid === true
            ? JSON.parse(parametersXColumn.outputValue)
            : [];

        if (common.isDefined(row.parametersFormula)) {
          if (!Array.isArray(parsedParameters)) {
            paramsSchemaError = 'Parameters formula must return an array';
          }

          if (common.isDefined(paramsSchemaError)) {
            row.parameters = [];
          } else {
            row.parameters = common.makeCopy(parsedParameters);
            row.parameters.forEach(x => {
              x.parameterType = common.ParameterTypeEnum.Field;
            });
          }
        }

        row.paramsSchemaError = paramsSchemaError;

        let filters: common.Filter[] = [];

        await forEachSeries(row.parameters, async parameter => {
          let parXColumn = processedXColumns.find(
            x => x.id === parameter.parameterId
          );

          let schemaError;
          let isJsonValid = false;

          let parsedParameter;

          if (parameter.parameterType === common.ParameterTypeEnum.Formula) {
            if (common.isUndefined(parXColumn.outputError)) {
              try {
                JSON.parse(parXColumn.outputValue);
                isJsonValid = true;
              } catch (e) {
                isJsonValid = false;
                schemaError = `Failed to calculate parameter. 
Check parameter formula and its dependences. 
Formula must return a valid JSON object.`;
              }
            } else {
              schemaError = parXColumn.outputError;
            }

            parameter.isJsonValid = isJsonValid;

            if (parameter.isJsonValid === true) {
              parsedParameter = JSON.parse(parXColumn.outputValue);
              parameter.conditions = parsedParameter.conditions;
            } else {
              parameter.conditions = ['any'];
            }
          }

          if (parameter.constructor !== Object) {
            schemaError = 'Parameter must be an object';
          } else if (common.isUndefined(parameter.filter)) {
            schemaError = 'Parameter must have a "filter" property';
          } else if (
            Array.isArray(parameter.filter) ||
            parameter.filter.constructor === Object
          ) {
            schemaError =
              'Parameter filter must be a string in a form of "alias.field_id"';
          } else if (common.isDefined(row.parametersFormula)) {
            let fieldId = parameter.filter.split('.').join('_').toUpperCase();
            parameter.parameterId = `${row.rowId}_${fieldId}`;

            let metric = metrics.find(m => m.metric_id === row.metricId);
            let model = models.find(ml => ml.model_id === metric.model_id);
            let field = model.fields.find(f => f.id === parameter.filter);

            if (common.isDefined(field)) {
              parameter.result = field.result;
            } else {
              schemaError =
                'Wrong parameter filter value. Model field is not found.';
            }
          }

          if (common.isDefined(schemaError)) {
            parameter.conditions = ['any'];
          }

          if (common.isUndefined(parameter.conditions)) {
            schemaError = 'Parameter conditions must be defined';
          } else if (!Array.isArray(parameter.conditions)) {
            schemaError = 'Parameter conditions must be an array';
          } else if (parameter.conditions.length === 0) {
            schemaError = 'Parameter conditions must have at least one element';
          } else {
            parameter.conditions.forEach(y => {
              if (
                common.isUndefined(y) ||
                Array.isArray(y) ||
                y.constructor === Object
              ) {
                schemaError =
                  'Parameter conditions must be an array of filter expressions';
              }
            });
          }

          if (common.isDefined(schemaError)) {
            parameter.conditions = ['any'];
          }

          let toBlockmlGetFractionsRequest: apiToBlockml.ToBlockmlGetFractionsRequest =
            {
              info: {
                name: apiToBlockml.ToBlockmlRequestInfoNameEnum
                  .ToBlockmlGetFractions,
                traceId: traceId
              },
              payload: {
                bricks: parameter.conditions,
                result: parameter.result
              }
            };

          let blockmlGetFractionsResponse =
            await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlGetFractionsResponse>(
              {
                routingKey:
                  common.RabbitBlockmlRoutingEnum.GetFractions.toString(),
                message: toBlockmlGetFractionsRequest,
                checkIsOk: true
              }
            );

          if (blockmlGetFractionsResponse.payload.isValid === false) {
            schemaError = `Parameter conditions are not valid for filter result "${parameter.result}"`;
          }

          let filter: common.Filter = {
            fieldId: parameter.filter,
            fractions: blockmlGetFractionsResponse.payload.fractions
          };

          filters.push(filter);

          if (
            common.isUndefined(schemaError) &&
            common.isDefined(parsedParameter)
          ) {
            if (common.isUndefined(parsedParameter.filter)) {
              schemaError = `Parameter "${parameter.filter}" must have a "filter" property`;
            } else if (parameter.filter !== parsedParameter.filter) {
              schemaError = `parameter filter "${parameter.filter}" does not match "${parsedParameter.filter}"`;
            }
          }

          parameter.schemaError = schemaError;
          parameter.isSchemaValid = common.isUndefined(schemaError);
          row.paramsSchemaError = row.paramsSchemaError || schemaError;
        });

        row.isParamsJsonValid = isParamsJsonValid;

        row.parametersJson =
          isParamsJsonValid === true
            ? common.makeCopy(parsedParameters)
            : common.isDefined(row.parametersFormula)
            ? common.makeCopy(parsedParameters)
            : common.makeCopy(
                row.parameters.map(x => {
                  let p = common.makeCopy({
                    filter: x.filter,
                    conditions: x.conditions
                  });
                  return p;
                })
              );

        row.isParamsSchemaValid = common.isUndefined(row.paramsSchemaError);

        row.parametersFiltersWithExcludedTime = filters;
        row.isCalculateParameters = false;
      }
    );

    return rows;
  }

  async calculateData(item: {
    rep: common.RepX;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
    traceId: string;
  }) {
    let { rep, timeSpec, timeRangeFraction, timezone, traceId } = item;

    // check for cycles - tarjan graph
    let g = new Graph();
    // graph for toposort
    let gr: string[][] = [];

    rep.rows.forEach(x => {
      x.formulaError = undefined;

      if (common.isDefined(x.formulaDeps) && x.formulaDeps.length > 0) {
        let wrongReferences: string[] = [];

        x.formulaDeps.forEach(dep => {
          if (rep.rows.map(r => r.rowId).indexOf(dep) < 0) {
            wrongReferences.push(dep);
          }
          g.add(x.rowId, [dep]);
          gr.push([x.rowId, dep]);
        });

        if (wrongReferences.length > 0) {
          x.formulaError = `Formula references not valid rows: ${wrongReferences.join(
            ', '
          )}`;
        }
      }
    });

    let cycledNames: string[] = [];

    if (g.hasCycle() === true) {
      let cycles: any[] = g.getCycles();

      cycledNames = cycles[0].map((c: any) => c.name);

      let cycledNamesStr = cycledNames.join(', ');

      rep.rows
        .filter(k => cycledNames.indexOf(k.rowId) > -1)
        .forEach(x => {
          if (common.isUndefined(x.formulaError)) {
            x.formulaError = `Cycle in formula references of rows: ${cycledNamesStr}`;
          }
          return x;
        });
    }

    let recordsByColumn = this.makeRecordsByColumn({
      rep: rep,
      timeSpec: timeSpec
    });

    // console.log('recordsByColumn:');
    // console.log(recordsByColumn);

    let topQueryData: any[] = [];
    let topQueryError: any;

    if (rep.rows.filter(x => common.isDefined(x.formulaError)).length > 0) {
      topQueryError = common.SOME_ROWS_HAVE_FORMULA_ERRORS;
    } else {
      let cn: pg.IConnectionParameters<pg.IClient> = {
        host: this.cs.get<interfaces.Config['firstProjectDwhPostgresHost']>(
          'firstProjectDwhPostgresHost'
        ),
        port: 5432,
        database: 'p_db',
        user: 'postgres',
        password: this.cs.get<
          interfaces.Config['firstProjectDwhPostgresPassword']
        >('firstProjectDwhPostgresPassword'),
        ssl: false
      };

      let timestampValues = recordsByColumn.map(x => x.fields['timestamp']);

      let mainSelect = [
        `unnest(ARRAY[${timestampValues}]) AS timestamp`,
        ...rep.rows
          .filter(row => row.rowType === common.RowTypeEnum.Metric)
          .map(row => {
            let values = recordsByColumn.map(
              r => r.fields[row.rowId] || 'NULL'
            );
            let str = `    unnest(ARRAY[${values}]) AS ${row.rowId}`;
            return str;
          })
      ];

      let mainSelectReady = mainSelect.join(',\n');

      let outerSelect = [
        `  main.timestamp as timestamp`,
        ...rep.rows
          .filter(row => row.rowType === common.RowTypeEnum.Metric)
          .map(x => `  main.${x.rowId} AS ${x.rowId}`),
        ...rep.rows
          .filter(row => row.rowType === common.RowTypeEnum.Formula)
          .map(row => {
            let newFormula = row.formula;
            let reg = common.MyRegex.CAPTURE_ROW_REF();
            let r;

            while ((r = reg.exec(newFormula))) {
              let reference = r[1];

              let targetRow = rep.rows.find(y => y.rowId === reference);

              let targetTo =
                targetRow.rowType === common.RowTypeEnum.Formula
                  ? targetRow.formula
                  : targetRow.rowType === common.RowTypeEnum.Metric
                  ? `main.${targetRow.rowId}`
                  : reference;

              newFormula =
                targetRow.rowType === common.RowTypeEnum.Metric
                  ? common.MyRegex.replaceRowIdsFinalNoPars(
                      newFormula,
                      reference,
                      targetTo
                    )
                  : common.MyRegex.replaceRowIdsFinalAddPars(
                      newFormula,
                      reference,
                      targetTo
                    );
            }

            let str = `  ${newFormula} as ${row.rowId}`;

            return str;
          })
      ];

      let outerSelectReady = outerSelect.join(',\n');

      let querySql = `WITH main AS (
  SELECT
    ${mainSelectReady}
)
SELECT
${outerSelectReady}
FROM main;`;

      let pgp = pgPromise({ noWarnings: true });
      let pgDb = pgp(cn);

      await pgDb
        .any(querySql)
        .then(async (data: any) => {
          topQueryData = data.map((r: any) => {
            Object.keys(r)
              .filter(y => y !== 'timestamp')
              .forEach(x => {
                r[x] = common.isDefined(r[x]) ? Number(r[x]) : undefined;
              });

            return r;
          });
        })
        .catch(async (e: any) => {
          topQueryError = e.message;
        });
    }

    let lastCalculatedTs = Number(helper.makeTs());

    let newKits: entities.KitEntity[] = [];

    rep.rows
      .filter(
        row =>
          row.rowType === common.RowTypeEnum.Metric ||
          row.rowType === common.RowTypeEnum.Formula
      )
      .forEach(row => {
        if (
          row.rowType === common.RowTypeEnum.Formula &&
          common.isDefined(row.formulaError)
        ) {
          row.topQueryError = row.formulaError;
          row.records = recordsByColumn.map((y: any, index) => ({
            id: index + 1,
            key: Number(y.fields['timestamp'].toString().split('.')[0]),
            value: undefined,
            error: undefined
          }));
        } else if (
          row.rowType === common.RowTypeEnum.Formula &&
          common.isDefined(topQueryError)
        ) {
          row.topQueryError = topQueryError;
          row.records = recordsByColumn.map((y: any, index) => ({
            id: index + 1,
            key: Number(y.fields['timestamp'].toString().split('.')[0]),
            value: undefined,
            error: undefined
          }));
        } else if (
          row.rowType === common.RowTypeEnum.Metric &&
          common.isDefined(topQueryError)
        ) {
          row.topQueryError = topQueryError;
          row.records = recordsByColumn.map((y: any, index) => ({
            id: index + 1,
            key: Number(y.fields['timestamp'].toString().split('.')[0]),
            value: y.fields[row.rowId],
            error: undefined
          }));
        } else if (common.isUndefined(topQueryError)) {
          row.topQueryError = undefined;
          row.records = topQueryData.map((y: any, index) => ({
            id: index + 1,
            key: Number(y.timestamp.toString().split('.')[0]),
            value: y[row.rowId.toLowerCase()],
            error: undefined
          }));
        }

        let rq = row.rqs.find(
          y =>
            y.fractionBrick === timeRangeFraction.brick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        if (row.rowType === common.RowTypeEnum.Formula) {
          rq.kitId = common.makeId();

          let newKit: entities.KitEntity = {
            struct_id: rep.structId,
            kit_id: rq.kitId,
            rep_id: rep.repId,
            data: row.records,
            server_ts: undefined
          };

          newKits.push(newKit);
        }

        rq.lastCalculatedTs = lastCalculatedTs;
      });

    if (newKits.length > 0) {
      await this.dbService.writeRecords({
        modify: false,
        records: {
          kits: newKits
        }
      });
    }

    return rep;
  }

  makeRecordsByColumn(item: {
    rep: common.RepX;
    timeSpec: common.TimeSpecEnum;
  }) {
    let { rep, timeSpec } = item;

    let recordsByColumn = rep.columns.map((column, i) => {
      let tsDate = fromUnixTime(column.columnId);

      let timeValue =
        timeSpec === common.TimeSpecEnum.Years
          ? format(tsDate, 'yyyy')
          : timeSpec === common.TimeSpecEnum.Quarters
          ? format(tsDate, 'yyyy-MM')
          : timeSpec === common.TimeSpecEnum.Months
          ? format(tsDate, 'yyyy-MM')
          : timeSpec === common.TimeSpecEnum.Weeks
          ? format(tsDate, 'yyyy-MM-dd')
          : timeSpec === common.TimeSpecEnum.Days
          ? format(tsDate, 'yyyy-MM-dd')
          : timeSpec === common.TimeSpecEnum.Hours
          ? format(tsDate, 'yyyy-MM-dd HH')
          : timeSpec === common.TimeSpecEnum.Minutes
          ? format(tsDate, 'yyyy-MM-dd HH:mm')
          : undefined;

      let record: any = {
        id: i,
        fields: {
          timestamp: column.columnId
        }
      };

      rep.rows
        .filter(row => row.rowType === common.RowTypeEnum.Metric)
        .forEach((row: common.Row) => {
          let timeFieldId = row.mconfig?.select[0]
            .split('.')
            .join('_')
            .toLowerCase();

          let fieldId = row.mconfig?.select[1]
            .split('.')
            .join('_')
            .toLowerCase();

          if (common.isDefined(row.query?.data)) {
            row.query.data = row.query.data.map((x: any) =>
              Object.keys(x).reduce((destination: any, key) => {
                destination[key.toLowerCase()] = x[key];
                return destination;
              }, {})
            );
          }

          let dataRow = row.query?.data?.find(
            (r: any) => r[timeFieldId]?.toString().split('.')[0] === timeValue
          );

          if (common.isDefined(dataRow)) {
            record.fields[row.rowId] = common.isUndefined(dataRow[fieldId])
              ? undefined
              : isNaN(dataRow[fieldId]) === false
              ? Number(dataRow[fieldId])
              : dataRow[fieldId];
          }
        });

      return record;
    });

    return recordsByColumn;
  }
}
