import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { RELATIONSHIP_TYPE_VALUES } from '#common/constants/top';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileProjectConf } from '#common/interfaces/blockml/internal/file-project-conf';
import { FileRelationship } from '#common/interfaces/blockml/internal/file-relationship';
import { FileRelationshipReference } from '#common/interfaces/blockml/internal/file-relationship-reference';
import { MyRegex } from '#common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.CheckRelationships;

export function checkRelationships(
  item: {
    conf: FileProjectConf;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let conf = item.conf;

  if (isUndefined(conf.relationships)) {
    conf.relationships = [];
    log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
    return;
  }

  let errorsOnStart = item.errors.length;

  conf.relationships.forEach(relElement => {
    if (isDefined(relElement) && relElement.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.RELATIONSHIP_ELEMENT_IS_NOT_A_DICTIONARY,
          message:
            'found at least one relationships element that is not a dictionary',
          lines: [
            {
              line: conf.relationships_line_num,
              name: conf.fileName,
              path: conf.filePath
            }
          ]
        })
      );
      return;
    }

    let relParameters = Object.keys(relElement).filter(
      x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM())
    );

    let relHasError = false;

    relParameters.forEach(parameter => {
      if (
        [
          ParameterEnum.Schema.toString(),
          ParameterEnum.References.toString()
        ].indexOf(parameter) < 0
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.UNKNOWN_RELATIONSHIP_PARAMETER,
            message: `parameter "${parameter}" cannot be used in relationships element`,
            lines: [
              {
                line: relElement[
                  (parameter + LINE_NUM) as keyof FileRelationship
                ] as number,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        relHasError = true;
        return;
      }

      if (
        Array.isArray(relElement[parameter as keyof FileRelationship]) &&
        [ParameterEnum.References.toString()].indexOf(parameter) < 0
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.RELATIONSHIP_UNEXPECTED_LIST,
            message: `parameter "${parameter}" must have a single value`,
            lines: [
              {
                line: relElement[
                  (parameter + LINE_NUM) as keyof FileRelationship
                ] as number,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        relHasError = true;
        return;
      }

      if (
        relElement[parameter as keyof FileRelationship]?.constructor ===
          Object &&
        [ParameterEnum.References.toString()].indexOf(parameter) < 0
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.RELATIONSHIP_UNEXPECTED_DICTIONARY,
            message: `parameter "${parameter}" must have a single value`,
            lines: [
              {
                line: relElement[
                  (parameter + LINE_NUM) as keyof FileRelationship
                ] as number,
                name: conf.fileName,
                path: conf.filePath
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

    if (relParameters.indexOf(ParameterEnum.Schema.toString()) < 0) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_RELATIONSHIP_SCHEMA,
          message: `parameter "${ParameterEnum.Schema}" is required for relationships element`,
          lines: [
            {
              line: conf.relationships_line_num,
              name: conf.fileName,
              path: conf.filePath
            }
          ]
        })
      );
      return;
    }

    let schemaValue = relElement.schema.toString();
    let hasDot = schemaValue.indexOf('.') > -1;

    if (!hasDot) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.WRONG_RELATIONSHIP_SCHEMA_FORMAT,
          message: `"${ParameterEnum.Schema}" value "${schemaValue}" must contain a dot to separate connection name from schema name`,
          lines: [
            {
              line: relElement.schema_line_num,
              name: conf.fileName,
              path: conf.filePath
            }
          ]
        })
      );
      return;
    }

    if (relParameters.indexOf(ParameterEnum.References.toString()) < 0) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_RELATIONSHIP_REFERENCES,
          message: `parameter "${ParameterEnum.References}" is required for relationships element`,
          lines: [
            {
              line: conf.relationships_line_num,
              name: conf.fileName,
              path: conf.filePath
            }
          ]
        })
      );
      return;
    }

    if (!Array.isArray(relElement.references)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.RELATIONSHIP_REFERENCES_IS_NOT_A_LIST,
          message: `parameter "${ParameterEnum.References}" must be a List`,
          lines: [
            {
              line: relElement.references_line_num,
              name: conf.fileName,
              path: conf.filePath
            }
          ]
        })
      );
      return;
    }

    relElement.references.forEach(refElement => {
      if (isDefined(refElement) && refElement.constructor !== Object) {
        item.errors.push(
          new BmError({
            title:
              ErTitleEnum.RELATIONSHIP_REFERENCE_ELEMENT_IS_NOT_A_DICTIONARY,
            message:
              'found at least one references element that is not a dictionary',
            lines: [
              {
                line: relElement.references_line_num,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        return;
      }

      let refParameters = Object.keys(refElement).filter(
        k => !k.match(MyRegex.ENDS_WITH_LINE_NUM())
      );

      let refHasError = false;

      refParameters.forEach(parameter => {
        if (
          [
            ParameterEnum.From.toString(),
            ParameterEnum.To.toString(),
            ParameterEnum.ToSchema.toString(),
            ParameterEnum.Type.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.UNKNOWN_RELATIONSHIP_REFERENCE_PARAMETER,
              message: `parameter "${parameter}" cannot be used in references element`,
              lines: [
                {
                  line: refElement[
                    (parameter + LINE_NUM) as keyof FileRelationshipReference
                  ] as number,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );
          refHasError = true;
          return;
        }

        if (
          Array.isArray(
            refElement[parameter as keyof FileRelationshipReference]
          )
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.RELATIONSHIP_REFERENCE_UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: refElement[
                    (parameter + LINE_NUM) as keyof FileRelationshipReference
                  ] as number,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );
          refHasError = true;
          return;
        }

        if (
          refElement[parameter as keyof FileRelationshipReference]
            ?.constructor === Object
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.RELATIONSHIP_REFERENCE_UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: refElement[
                    (parameter + LINE_NUM) as keyof FileRelationshipReference
                  ] as number,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );
          refHasError = true;
          return;
        }
      });

      if (refHasError) {
        return;
      }

      if (refParameters.indexOf(ParameterEnum.From.toString()) < 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_RELATIONSHIP_REFERENCE_FROM,
            message: `parameter "${ParameterEnum.From}" is required for references element`,
            lines: [
              {
                line: relElement.references_line_num,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        return;
      }

      if (refParameters.indexOf(ParameterEnum.To.toString()) < 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_RELATIONSHIP_REFERENCE_TO,
            message: `parameter "${ParameterEnum.To}" is required for references element`,
            lines: [
              {
                line: relElement.references_line_num,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        return;
      }

      if (refParameters.indexOf(ParameterEnum.Type.toString()) < 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_RELATIONSHIP_REFERENCE_TYPE,
            message: `parameter "${ParameterEnum.Type}" is required for references element`,
            lines: [
              {
                line: relElement.references_line_num,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        return;
      }

      let typeValue = refElement.type.toString();
      let isValidType =
        RELATIONSHIP_TYPE_VALUES.map(x => x.toString()).indexOf(typeValue) > -1;

      if (!isValidType) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_RELATIONSHIP_REFERENCE_TYPE,
            message: `"${ParameterEnum.Type}" value "${typeValue}" is not valid. Use one of: ${RELATIONSHIP_TYPE_VALUES.join(', ')}`,
            lines: [
              {
                line: refElement.type_line_num,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        return;
      }

      let fromValue = refElement.from.toString();
      let fromMatch = fromValue.match(/^\w+\.\w+$/);

      if (!fromMatch) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_RELATIONSHIP_REFERENCE_FROM_FORMAT,
            message: `"${ParameterEnum.From}" value "${fromValue}" must be in "table.column" format`,
            lines: [
              {
                line: refElement.from_line_num,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        return;
      }

      let toValue = refElement.to.toString();
      let toMatch = toValue.match(/^\w+\.\w+$/);

      if (!toMatch) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_RELATIONSHIP_REFERENCE_TO_FORMAT,
            message: `"${ParameterEnum.To}" value "${toValue}" must be in "table.column" format`,
            lines: [
              {
                line: refElement.to_line_num,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
        return;
      }
    });
  });

  if (errorsOnStart !== item.errors.length) {
    conf.relationships = [];
  }

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
}
