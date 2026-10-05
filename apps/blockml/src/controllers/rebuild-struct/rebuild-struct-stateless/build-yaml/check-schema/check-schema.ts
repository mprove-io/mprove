import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FileSchema } from '#common/types/blockml/parts/internal/file-schema';
import type { FileSchemaColumn } from '#common/types/blockml/parts/internal/file-schema-column';
import type { FileSchemaRelationship } from '#common/types/blockml/parts/internal/file-schema-relationship';
import type { FileSchemaTable } from '#common/types/blockml/parts/internal/file-schema-table';
import {
  type RelationshipType,
  relationshipTypeValues
} from '#common/types/shared/schema/relationship-type';
import { getExpectedMirrorType } from './get-expected-mirror-type/get-expected-mirror-type';

let func: Func = 'build-yaml/check-schema';

export function checkSchema(item: {
  schemas: FileSchema[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<void, never> {
  let { caller, structId, cs } = item;
  log(cs, caller, func, structId, 'input.log', item);

  item.schemas.forEach(schema => {
    let errorsOnStart = item.errors.length;

    let schemaParameters = Object.keys(schema).filter(
      x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM())
    );

    // Validate schema value exists
    if (schemaParameters.indexOf('schema' satisfies FileParameter) < 0) {
      item.errors.push(
        new BmError({
          title: 'MISSING_SCHEMA',
          message: `parameter "${'schema' satisfies FileParameter}" is required`,
          lines: [
            {
              line: 0,
              name: schema.fileName,
              path: schema.filePath
            }
          ]
        })
      );
      return;
    }

    let schemaValue = schema.schema.toString();
    let hasDot = schemaValue.indexOf('.') > -1;

    if (!hasDot) {
      item.errors.push(
        new BmError({
          title: 'WRONG_SCHEMA_FORMAT',
          message: `"${'schema' satisfies FileParameter}" value "${schemaValue}" must contain a dot to separate connection name from schema name`,
          lines: [
            {
              line: schema.schema_line_num,
              name: schema.fileName,
              path: schema.filePath
            }
          ]
        })
      );
      return;
    }

    // Validate tables exists
    if (schemaParameters.indexOf('tables' satisfies FileParameter) < 0) {
      item.errors.push(
        new BmError({
          title: 'MISSING_TABLES',
          message: `parameter "${'tables' satisfies FileParameter}" is required`,
          lines: [
            {
              line: 0,
              name: schema.fileName,
              path: schema.filePath
            }
          ]
        })
      );
      return;
    }

    if (!Array.isArray(schema.tables)) {
      item.errors.push(
        new BmError({
          title: 'SCHEMA_TABLES_IS_NOT_A_LIST',
          message: `parameter "${'tables' satisfies FileParameter}" must be a List`,
          lines: [
            {
              line: schema.tables_line_num,
              name: schema.fileName,
              path: schema.filePath
            }
          ]
        })
      );
      return;
    }

    let tableErrorsOnStart = item.errors.length;

    schema.tables.forEach(tableElement => {
      if (isDefined(tableElement) && tableElement.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: 'SCHEMA_TABLE_ELEMENT_IS_NOT_A_DICTIONARY',
            message:
              'found at least one tables element that is not a dictionary',
            lines: [
              {
                line: schema.tables_line_num,
                name: schema.fileName,
                path: schema.filePath
              }
            ]
          })
        );
        return;
      }

      let tableParameters = Object.keys(tableElement).filter(
        x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM())
      );

      let tableHasError = false;

      tableParameters.forEach(parameter => {
        if (
          (
            ['table', 'description', 'columns'] satisfies FileParameter[]
          ).findIndex(candidate => candidate === parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: 'UNKNOWN_SCHEMA_TABLE_PARAMETER',
              message: `parameter "${parameter}" cannot be used in tables element`,
              lines: [
                {
                  line: tableElement[
                    (parameter + LINE_NUM) as keyof FileSchemaTable
                  ] as number,
                  name: schema.fileName,
                  path: schema.filePath
                }
              ]
            })
          );
          tableHasError = true;
          return;
        }

        if (
          Array.isArray(tableElement[parameter as keyof FileSchemaTable]) &&
          parameter !== ('columns' satisfies FileParameter)
        ) {
          item.errors.push(
            new BmError({
              title: 'SCHEMA_TABLE_UNEXPECTED_LIST',
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: tableElement[
                    (parameter + LINE_NUM) as keyof FileSchemaTable
                  ] as number,
                  name: schema.fileName,
                  path: schema.filePath
                }
              ]
            })
          );
          tableHasError = true;
          return;
        }

        if (
          tableElement[parameter as keyof FileSchemaTable]?.constructor ===
            Object &&
          parameter !== ('columns' satisfies FileParameter)
        ) {
          item.errors.push(
            new BmError({
              title: 'SCHEMA_TABLE_UNEXPECTED_DICTIONARY',
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: tableElement[
                    (parameter + LINE_NUM) as keyof FileSchemaTable
                  ] as number,
                  name: schema.fileName,
                  path: schema.filePath
                }
              ]
            })
          );
          tableHasError = true;
          return;
        }
      });

      if (tableHasError) {
        return;
      }

      if (tableParameters.indexOf('table' satisfies FileParameter) < 0) {
        item.errors.push(
          new BmError({
            title: 'MISSING_SCHEMA_TABLE',
            message: `parameter "${'table' satisfies FileParameter}" is required for tables element`,
            lines: [
              {
                line: schema.tables_line_num,
                name: schema.fileName,
                path: schema.filePath
              }
            ]
          })
        );
        return;
      }

      if (isUndefined(tableElement.columns)) {
        return;
      }

      if (!Array.isArray(tableElement.columns)) {
        item.errors.push(
          new BmError({
            title: 'SCHEMA_COLUMNS_IS_NOT_A_LIST',
            message: `parameter "${'columns' satisfies FileParameter}" must be a List`,
            lines: [
              {
                line: tableElement.columns_line_num,
                name: schema.fileName,
                path: schema.filePath
              }
            ]
          })
        );
        return;
      }

      tableElement.columns.forEach(columnElement => {
        if (isDefined(columnElement) && columnElement.constructor !== Object) {
          item.errors.push(
            new BmError({
              title: 'SCHEMA_COLUMN_ELEMENT_IS_NOT_A_DICTIONARY',
              message:
                'found at least one columns element that is not a dictionary',
              lines: [
                {
                  line: tableElement.columns_line_num,
                  name: schema.fileName,
                  path: schema.filePath
                }
              ]
            })
          );
          return;
        }

        let columnParameters = Object.keys(columnElement).filter(
          x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM())
        );

        let columnHasError = false;

        columnParameters.forEach(parameter => {
          if (
            (
              [
                'column',
                'example',
                'cache_unique_values',
                'description',
                'relationships'
              ] satisfies FileParameter[]
            ).findIndex(candidate => candidate === parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'UNKNOWN_SCHEMA_COLUMN_PARAMETER',
                message: `parameter "${parameter}" cannot be used in columns element`,
                lines: [
                  {
                    line: columnElement[
                      (parameter + LINE_NUM) as keyof FileSchemaColumn
                    ] as number,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            columnHasError = true;
            return;
          }

          if (
            Array.isArray(columnElement[parameter as keyof FileSchemaColumn]) &&
            parameter !== ('relationships' satisfies FileParameter)
          ) {
            item.errors.push(
              new BmError({
                title: 'SCHEMA_COLUMN_UNEXPECTED_LIST',
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: columnElement[
                      (parameter + LINE_NUM) as keyof FileSchemaColumn
                    ] as number,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            columnHasError = true;
            return;
          }

          if (
            columnElement[parameter as keyof FileSchemaColumn]?.constructor ===
              Object &&
            parameter !== ('relationships' satisfies FileParameter)
          ) {
            item.errors.push(
              new BmError({
                title: 'SCHEMA_COLUMN_UNEXPECTED_DICTIONARY',
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: columnElement[
                      (parameter + LINE_NUM) as keyof FileSchemaColumn
                    ] as number,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            columnHasError = true;
            return;
          }

          if (
            parameter === ('cache_unique_values' satisfies FileParameter) &&
            !columnElement[parameter as keyof FileSchemaColumn]
              .toString()
              .match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: 'WRONG_SCHEMA_COLUMN_CACHE_UNIQUE_VALUES',
                message: `parameter "${parameter}:" must be "true" or "false" if specified`,
                lines: [
                  {
                    line: columnElement[
                      (parameter + LINE_NUM) as keyof FileSchemaColumn
                    ] as number,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            columnHasError = true;
            return;
          }
        });

        if (columnHasError) {
          return;
        }

        if (columnParameters.indexOf('column' satisfies FileParameter) < 0) {
          item.errors.push(
            new BmError({
              title: 'MISSING_SCHEMA_COLUMN',
              message: `parameter "${'column' satisfies FileParameter}" is required for columns element`,
              lines: [
                {
                  line: tableElement.columns_line_num,
                  name: schema.fileName,
                  path: schema.filePath
                }
              ]
            })
          );
          return;
        }

        if (isUndefined(columnElement.relationships)) {
          return;
        }

        if (!Array.isArray(columnElement.relationships)) {
          item.errors.push(
            new BmError({
              title: 'SCHEMA_RELATIONSHIPS_IS_NOT_A_LIST',
              message: `parameter "${'relationships' satisfies FileParameter}" must be a List`,
              lines: [
                {
                  line: columnElement.relationships_line_num,
                  name: schema.fileName,
                  path: schema.filePath
                }
              ]
            })
          );
          return;
        }

        let relErrorsOnStart = item.errors.length;

        columnElement.relationships.forEach(relElement => {
          if (isDefined(relElement) && relElement.constructor !== Object) {
            item.errors.push(
              new BmError({
                title: 'SCHEMA_RELATIONSHIP_ELEMENT_IS_NOT_A_DICTIONARY',
                message:
                  'found at least one relationships element that is not a dictionary',
                lines: [
                  {
                    line: columnElement.relationships_line_num,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            return;
          }

          let relParameters = Object.keys(relElement).filter(
            k => !k.match(MyRegex.ENDS_WITH_LINE_NUM())
          );

          let relHasError = false;

          relParameters.forEach(parameter => {
            if (
              (['to', 'to_schema', 'type'] satisfies FileParameter[]).findIndex(
                candidate => candidate === parameter
              ) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_SCHEMA_RELATIONSHIP_PARAMETER',
                  message: `parameter "${parameter}" cannot be used in relationships element`,
                  lines: [
                    {
                      line: relElement[
                        (parameter + LINE_NUM) as keyof FileSchemaRelationship
                      ] as number,
                      name: schema.fileName,
                      path: schema.filePath
                    }
                  ]
                })
              );
              relHasError = true;
              return;
            }

            if (
              Array.isArray(
                relElement[parameter as keyof FileSchemaRelationship]
              )
            ) {
              item.errors.push(
                new BmError({
                  title: 'SCHEMA_RELATIONSHIP_UNEXPECTED_LIST',
                  message: `parameter "${parameter}" must have a single value`,
                  lines: [
                    {
                      line: relElement[
                        (parameter + LINE_NUM) as keyof FileSchemaRelationship
                      ] as number,
                      name: schema.fileName,
                      path: schema.filePath
                    }
                  ]
                })
              );
              relHasError = true;
              return;
            }

            if (
              relElement[parameter as keyof FileSchemaRelationship]
                ?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title: 'SCHEMA_RELATIONSHIP_UNEXPECTED_DICTIONARY',
                  message: `parameter "${parameter}" must have a single value`,
                  lines: [
                    {
                      line: relElement[
                        (parameter + LINE_NUM) as keyof FileSchemaRelationship
                      ] as number,
                      name: schema.fileName,
                      path: schema.filePath
                    }
                  ]
                })
              );
              relHasError = true;
              return;
            }
          });

          if (relHasError) {
            return;
          }

          if (relParameters.indexOf('to' satisfies FileParameter) < 0) {
            item.errors.push(
              new BmError({
                title: 'MISSING_SCHEMA_RELATIONSHIP_TO',
                message: `parameter "${'to' satisfies FileParameter}" is required for relationships element`,
                lines: [
                  {
                    line: columnElement.relationships_line_num,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            return;
          }

          if (relParameters.indexOf('type' satisfies FileParameter) < 0) {
            item.errors.push(
              new BmError({
                title: 'MISSING_SCHEMA_RELATIONSHIP_TYPE',
                message: `parameter "${'type' satisfies FileParameter}" is required for relationships element`,
                lines: [
                  {
                    line: columnElement.relationships_line_num,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            return;
          }

          let typeValue: string = relElement.type.toString();

          if (
            relationshipTypeValues.findIndex(
              candidate => candidate === typeValue
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'WRONG_SCHEMA_RELATIONSHIP_TYPE',
                message: `"${'type' satisfies FileParameter}" value "${typeValue}" is not valid. Use one of: ${relationshipTypeValues.join(', ')}`,
                lines: [
                  {
                    line: relElement.type_line_num,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            return;
          }

          let toValue = relElement.to.toString();
          let toMatch = toValue.match(/^\w+\.\w+$/);

          if (!toMatch) {
            item.errors.push(
              new BmError({
                title: 'WRONG_SCHEMA_RELATIONSHIP_TO_FORMAT',
                message: `"${'to' satisfies FileParameter}" value "${toValue}" must be in "table.column" format`,
                lines: [
                  {
                    line: relElement.to_line_num,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
            return;
          }

          if (isDefined(relElement.to_schema)) {
            let toSchemaValue = relElement.to_schema.toString();
            let toSchemaDotIndex = toSchemaValue.indexOf('.');

            if (toSchemaDotIndex < 0) {
              item.errors.push(
                new BmError({
                  title: 'WRONG_SCHEMA_RELATIONSHIP_TO_SCHEMA_FORMAT',
                  message: `"${'to_schema' satisfies FileParameter}" value "${toSchemaValue}" must contain a dot to separate connection name from schema name`,
                  lines: [
                    {
                      line: relElement.to_schema_line_num,
                      name: schema.fileName,
                      path: schema.filePath
                    }
                  ]
                })
              );
              return;
            }

            let toSchemaConnectionId = toSchemaValue.substring(
              0,
              toSchemaDotIndex
            );
            let schemaConnectionId = schemaValue.substring(
              0,
              schemaValue.indexOf('.')
            );

            if (toSchemaConnectionId !== schemaConnectionId) {
              item.errors.push(
                new BmError({
                  title: 'WRONG_SCHEMA_RELATIONSHIP_TO_SCHEMA_CONNECTION',
                  message: `"${'to_schema' satisfies FileParameter}" connection "${toSchemaConnectionId}" must match "${'schema' satisfies FileParameter}" connection "${schemaConnectionId}"`,
                  lines: [
                    {
                      line: relElement.to_schema_line_num,
                      name: schema.fileName,
                      path: schema.filePath
                    }
                  ]
                })
              );
              return;
            }
          }
        });

        let hasRelErrors = item.errors.length > relErrorsOnStart;
        if (hasRelErrors) {
          return;
        }

        // Duplicate detection within a column
        let relKeyMap: Map<string, number[]> = new Map();

        columnElement.relationships.forEach(relElement => {
          let toValue = relElement.to.toString();
          let toSchemaValue = isDefined(relElement.to_schema)
            ? relElement.to_schema.toString()
            : '';
          let key = toValue + '|' + toSchemaValue;

          let existing = relKeyMap.get(key);
          if (isUndefined(existing)) {
            relKeyMap.set(key, [relElement.to_line_num]);
          } else {
            existing.push(relElement.to_line_num);
          }
        });

        let hasDuplicates = false;

        relKeyMap.forEach(lineNums => {
          if (lineNums.length > 1) {
            hasDuplicates = true;
            item.errors.push(
              new BmError({
                title: 'SCHEMA_RELATIONSHIP_DUPLICATE',
                message:
                  'duplicate relationship with same "to" value found within the same column',
                lines: lineNums.map(l => ({
                  line: l,
                  name: schema.fileName,
                  path: schema.filePath
                }))
              })
            );
          }
        });

        if (hasDuplicates) {
          return;
        }
      });
    });

    let hasTableErrors = item.errors.length > tableErrorsOnStart;
    if (hasTableErrors) {
      schema.tables = [];
      return;
    }

    // Mirror type mismatch detection across all columns within the schema
    let allRels: {
      fromTable: string;
      fromColumn: string;
      toTable: string;
      toColumn: string;
      toSchema: string;
      type: RelationshipType;
      typeLine: number;
    }[] = [];

    schema.tables.forEach(tableElement => {
      (tableElement.columns ?? []).forEach(columnElement => {
        (columnElement.relationships ?? []).forEach(relElement => {
          let [toTable, toColumn] = relElement.to.toString().split('.');
          allRels.push({
            fromTable: tableElement.table.toString(),
            fromColumn: columnElement.column.toString(),
            toTable: toTable,
            toColumn: toColumn,
            toSchema: isDefined(relElement.to_schema)
              ? relElement.to_schema.toString()
              : '',
            type: relElement.type,
            typeLine: relElement.type_line_num
          });
        });
      });
    });

    allRels.forEach((relA, i) => {
      allRels.slice(i + 1).forEach(relB => {
        let isMirror =
          relA.fromTable === relB.toTable &&
          relA.fromColumn === relB.toColumn &&
          relA.toTable === relB.fromTable &&
          relA.toColumn === relB.fromColumn &&
          relA.toSchema === relB.toSchema;

        if (isMirror) {
          let expectedType = getExpectedMirrorType({ type: relA.type });
          let actualType = relB.type;

          let isTypeMismatch = expectedType !== actualType;

          if (isTypeMismatch) {
            item.errors.push(
              new BmError({
                title: 'SCHEMA_RELATIONSHIP_TYPE_MISMATCH',
                message: `mirror relationships have incompatible types: "${relA.type}" and "${relB.type}"`,
                lines: [
                  {
                    line: relA.typeLine,
                    name: schema.fileName,
                    path: schema.filePath
                  },
                  {
                    line: relB.typeLine,
                    name: schema.fileName,
                    path: schema.filePath
                  }
                ]
              })
            );
          }
        }
      });
    });

    if (errorsOnStart !== item.errors.length) {
      schema.tables = [];
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  return Result.succeed();
}
