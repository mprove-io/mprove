import type {
  ModelDef as MalloyModelDef,
  SourceDef as MalloySourceDef
} from '@malloydata/malloy';
import type { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import type { ConfigService } from '@nestjs/config';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { MalloySourceField } from '#blockml/types/malloy-source-field';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FlatMalloyFieldItem } from '#common/zod/blockml/internal/flat-malloy-field-item';
import { flattenMalloyFieldItemsRecursive } from './flatten-malloy-field-items-recursive/flatten-malloy-field-items-recursive';
import { getMalloySourceAnnotationValues } from './get-malloy-source-annotation-values/get-malloy-source-annotation-values';
import { makeMalloySourceErrorLine } from './make-malloy-source-error-line/make-malloy-source-error-line';

export function getMalloyFieldItems(item: {
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

  let fieldItems = flattenMalloyFieldItemsRecursive({
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
