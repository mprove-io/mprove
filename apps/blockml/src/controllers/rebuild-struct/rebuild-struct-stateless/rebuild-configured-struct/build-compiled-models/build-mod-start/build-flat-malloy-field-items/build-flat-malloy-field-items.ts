import {
  type ModelDef as MalloyModelDef,
  type SourceDef as MalloySourceDef
} from '@malloydata/malloy';
import type {
  FieldInfo,
  ModelEntryValueWithSource
} from '@malloydata/malloy-interfaces';
import type { ConfigService } from '@nestjs/config';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/extra/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type {
  FlatMalloyFieldItem,
  MalloySourceExpression
} from '#common/zod/blockml/internal/flat-malloy-field-item';

let func = FuncEnum.BuildFlatMalloyFieldItems;

const EXPLORER_FILTER_FIELD_PREFIX: string = '#NO_UI';

const INDEX_FIELDS = [
  'fieldName',
  'fieldPath',
  'fieldValue',
  'fieldType',
  'fieldRange',
  'weight'
] as const;

type MalloyAnnotations = {
  inherits?: MalloyAnnotations;
  blockNotes?: Array<{ text: string }>;
  notes?: Array<{ text: string }>;
};

type MalloySourceField = {
  accessModifier?: string;
  as?: string;
  name?: string;
  type?: string;
  expressionType?: string;
  annotations?: MalloyAnnotations;
  fields?: MalloySourceField[];
  e?: MalloySourceExpression;
  location?: {
    url?: string;
    range?: {
      start?: {
        line?: number;
      };
    };
  };
};

type MalloyFieldItem = {
  path: string[];
  field: FieldInfo;
  sourceField: MalloySourceField;
};

export function buildFlatMalloyFieldItems(
  item: {
    mods: FileMod[];
    projectId: string;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newMods: FileMod[] = [];

  item.mods.forEach(mod => {
    let malloyModel = mod.malloyModel;
    let source = mod.source;
    let valueWithSourceInfo = mod.valueWithSourceInfo;

    if (
      isUndefined(malloyModel) ||
      isUndefined(source) ||
      isUndefined(valueWithSourceInfo)
    ) {
      return;
    }

    mod.flatMalloyFieldItems = getMalloyFieldItems({
      malloyModelDef: malloyModel._modelDef,
      source: source,
      valueWithSourceInfo: valueWithSourceInfo,
      fileName: mod.fileName,
      filePath: mod.filePath,
      projectId: item.projectId,
      cs: cs
    });

    newMods.push(mod);
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Mods, newMods);

  return newMods;
}

function getMalloyFieldItems(item: {
  malloyModelDef: MalloyModelDef;
  source: string;
  valueWithSourceInfo: ModelEntryValueWithSource;
  fileName: string;
  filePath: string;
  projectId?: string;
  cs: ConfigService<BlockmlConfig>;
}) {
  let sourceDef = item.malloyModelDef.contents[item.source] as MalloySourceDef;
  let sourceFields = sourceDef.fields as MalloySourceField[];
  let stableFields = item.valueWithSourceInfo.schema.fields;

  let fieldItems = flattenMalloyFieldItems({
    sourceFields: sourceFields,
    stableFields: stableFields,
    path: []
  });

  return fieldItems.map(fieldItem => {
    let sourceField = fieldItem.sourceField;

    let sourceErrorLine = makeMalloySourceErrorLine({
      sourceField: sourceField,
      fileName: item.fileName,
      filePath: item.filePath,
      cs: item.cs
    });

    let sourceFieldLocationUrl = sourceField.location?.url;
    let filePath = sourceErrorLine.path;
    let projectIdIsDefined = isDefined(item.projectId);
    let sourceFieldLocationUrlIsDefined = isDefined(sourceFieldLocationUrl);

    if (projectIdIsDefined && sourceFieldLocationUrlIsDefined) {
      let filePathStartIndex = sourceFieldLocationUrl.indexOf(
        item.projectId + '/'
      );
      let filePathStartIndexIsValid = filePathStartIndex > -1;

      if (filePathStartIndexIsValid) {
        filePath = sourceFieldLocationUrl.slice(filePathStartIndex);
      }
    }

    let malloyFieldItem: FlatMalloyFieldItem = {
      path: fieldItem.path,
      field: fieldItem.field,
      fileName: sourceErrorLine.name,
      filePath: filePath,
      lineNum: sourceErrorLine.line,
      sourceExpression: sourceField.e,
      sourceAnnotationValues: getMalloySourceAnnotationValues({
        annotations: sourceField.annotations
      })
    };

    // console.log('malloyFieldItem')
    // console.dir(malloyFieldItem, { depth: null });

    return malloyFieldItem;
  });
}

function flattenMalloyFieldItems(item: {
  sourceFields: MalloySourceField[];
  stableFields: FieldInfo[];
  path: string[];
}): MalloyFieldItem[] {
  return item.sourceFields.flatMap<MalloyFieldItem>(sourceField => {
    let fieldName = sourceField.as || sourceField.name;
    let fieldNameIsUndefined = isUndefined(fieldName);

    if (fieldNameIsUndefined) {
      return [];
    }

    let stableField = item.stableFields.find(field => {
      return field.name === fieldName;
    });
    let stableFieldIsUndefined = isUndefined(stableField);

    if (stableFieldIsUndefined) {
      return [];
    }

    let filterFieldAnnotation = stableField.annotations?.find(annotation => {
      return annotation.value.startsWith(EXPLORER_FILTER_FIELD_PREFIX);
    });
    let fieldIsHidden = isDefined(filterFieldAnnotation);

    if (fieldIsHidden) {
      return [];
    }

    switch (stableField.kind) {
      case 'view': {
        let indexFieldNames = new Set([
          ...INDEX_FIELDS,
          ...stableField.schema.fields.map(field => field.name)
        ]);
        let fieldIsIndexView = indexFieldNames.size === INDEX_FIELDS.length;
        let fieldIsNested = item.path.length > 0;

        if (fieldIsIndexView || fieldIsNested) {
          return [];
        }

        return [
          {
            path: item.path,
            field: stableField,
            sourceField: sourceField
          }
        ];
      }
      case 'measure':
      case 'dimension': {
        let fieldItem = {
          path: item.path,
          field: stableField,
          sourceField: sourceField
        };

        if (
          stableField.type.kind === 'array_type' &&
          stableField.type.element_type.kind === 'record_type'
        ) {
          let nestedSourceFields = sourceField.fields || [];
          let nestedStableFields = stableField.type.element_type.fields.map(
            dimension => ({
              kind: stableField.kind,
              ...dimension
            })
          );

          return [
            fieldItem,
            ...flattenMalloyFieldItems({
              sourceFields: nestedSourceFields,
              stableFields: nestedStableFields,
              path: [...item.path, stableField.name]
            })
          ];
        }

        if (stableField.type.kind === 'record_type') {
          let nestedSourceFields = sourceField.fields || [];
          let nestedStableFields = stableField.type.fields.map(dimension => ({
            kind: stableField.kind,
            ...dimension
          }));

          return [
            fieldItem,
            ...flattenMalloyFieldItems({
              sourceFields: nestedSourceFields,
              stableFields: nestedStableFields,
              path: [...item.path, stableField.name]
            })
          ];
        }

        return [fieldItem];
      }
      case 'join':
        return flattenMalloyFieldItems({
          sourceFields: sourceField.fields || [],
          stableFields: stableField.schema.fields,
          path: [...item.path, stableField.name]
        });
      default:
        return [];
    }
  });
}

function getMalloySourceAnnotationValues(item: {
  annotations: MalloyAnnotations | undefined;
}) {
  let values: string[] = [];

  collectMalloySourceAnnotationValues({
    annotations: item.annotations,
    values: values
  });

  return values;
}

function collectMalloySourceAnnotationValues(item: {
  annotations: MalloyAnnotations | undefined;
  values: string[];
}) {
  if (isUndefined(item.annotations)) {
    return;
  }

  collectMalloySourceAnnotationValues({
    annotations: item.annotations.inherits,
    values: item.values
  });

  item.annotations.blockNotes?.forEach(note => {
    item.values.push(note.text);
  });

  item.annotations.notes?.forEach(note => {
    item.values.push(note.text);
  });
}

function makeMalloySourceErrorLine(item: {
  sourceField: MalloySourceField | undefined;
  fileName: string;
  filePath: string;
  cs: ConfigService<BlockmlConfig>;
}) {
  let sourceFieldLine = item.sourceField?.location?.range?.start?.line;
  let line = isDefined(sourceFieldLine) ? sourceFieldLine + 1 : 0;

  let sourceUrl = item.sourceField?.location?.url;
  let sourceUrlIsUndefined = isUndefined(sourceUrl);

  if (sourceUrlIsUndefined) {
    return {
      line: line,
      name: item.fileName,
      path: item.filePath
    };
  }

  let blockmlDataPath =
    item.cs.get<BlockmlConfig['blockmlData']>('blockmlData');

  blockmlDataPath = blockmlDataPath.endsWith('/')
    ? blockmlDataPath.slice(0, -1)
    : blockmlDataPath;

  let part = sourceUrl.split(blockmlDataPath)[1];
  let partIsUndefined = isUndefined(part);

  if (partIsUndefined) {
    return {
      line: line,
      name: item.fileName,
      path: item.filePath
    };
  }

  let partArray = part.split('/');

  partArray.shift();
  partArray.shift();

  let filePath = partArray.join('/');
  let fileName = partArray[partArray.length - 1];

  return {
    line: line,
    name: fileName,
    path: filePath
  };
}
