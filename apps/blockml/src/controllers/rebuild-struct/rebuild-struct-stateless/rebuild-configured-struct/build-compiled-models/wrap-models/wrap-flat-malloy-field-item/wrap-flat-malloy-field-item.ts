import type { AtomicType } from '@malloydata/malloy-interfaces';
import { parseTags } from '#blockml/functions/parse-tags/parse-tags';
import {
  DOUBLE_UNDERSCORE,
  MPROVE_TAG_FIELD_GROUP,
  NO_CAPITALIZE_LIST
} from '#common/constants/top';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FlatMalloyFieldItem } from '#common/zod/blockml/internal/flat-malloy-field-item';
import type { ModelField } from '#common/zod/blockml/model-field';
import type { ModelNode } from '#common/zod/blockml/model-node';

type FieldItemFieldWithAtomicType = FlatMalloyFieldItem['field'] & {
  type: AtomicType & { timeframe?: string };
};

export function wrapFlatMalloyFieldItem(item: {
  topNode: ModelNode;
  flatMalloyFieldItem: FlatMalloyFieldItem;
  alias: string;
  fileName: string;
}) {
  let { flatMalloyFieldItem, alias, fileName, topNode } = item;

  let fieldId = [
    ...flatMalloyFieldItem.path,
    flatMalloyFieldItem.field.name
  ].join('.');

  let field = flatMalloyFieldItem.field as FieldItemFieldWithAtomicType;

  let fieldType = field.type;

  let typeKind = fieldType.kind;

  let result =
    typeKind === 'string_type'
      ? FieldResultEnum.String
      : typeKind === 'number_type'
        ? FieldResultEnum.Number
        : typeKind === 'boolean_type'
          ? FieldResultEnum.Boolean
          : typeKind === 'timestamp_type' || typeKind === 'timestamptz_type'
            ? FieldResultEnum.Ts
            : typeKind === 'date_type'
              ? FieldResultEnum.Date
              : typeKind === 'array_type'
                ? FieldResultEnum.Array
                : typeKind === 'record_type'
                  ? FieldResultEnum.Record
                  : typeKind === 'json_type'
                    ? FieldResultEnum.Json
                    : typeKind === 'sql_native_type'
                      ? FieldResultEnum.SqlNative
                      : undefined;

  let fieldClass =
    flatMalloyFieldItem.field.kind === 'dimension'
      ? FieldClassEnum.Dimension
      : flatMalloyFieldItem.field.kind === 'measure'
        ? FieldClassEnum.Measure
        : undefined;

  let fieldLabel = flatMalloyFieldItem.field.name
    .split('_')
    .map(k =>
      NO_CAPITALIZE_LIST.indexOf(k) < 0 ? capitalizeFirstLetter(k) : k
    )
    .join(' ');

  let fieldSqlName =
    flatMalloyFieldItem.path.length > 0
      ? flatMalloyFieldItem.path.join(DOUBLE_UNDERSCORE) +
        DOUBLE_UNDERSCORE +
        flatMalloyFieldItem.field.name
      : flatMalloyFieldItem.field.name;

  let { malloyTags, mproveTags } = parseTags({
    inputs: flatMalloyFieldItem.field.annotations?.map(x => x.value) || []
  });

  let fieldNode: ModelNode = {
    id: fieldId,
    label: fieldLabel,
    description: undefined,
    hidden: false,
    required: false,
    isField: true,
    children: [],
    fieldFileName: fileName,
    fieldFilePath: flatMalloyFieldItem.filePath,
    fieldResult: result,
    fieldLineNum: flatMalloyFieldItem.lineNum,
    nodeClass: fieldClass
  };

  let fieldGroupTag = mproveTags.find(x => x.key === MPROVE_TAG_FIELD_GROUP);

  let fieldTimeGroupValue = fieldGroupTag?.value;

  if (isDefined(fieldTimeGroupValue)) {
    let groupNode = topNode.children.find(
      c => c.id === `${alias}.${fieldTimeGroupValue}`
    );

    if (isDefined(groupNode)) {
      groupNode.children.push(fieldNode);
    } else {
      let newGroupNode: ModelNode = {
        id: `${alias}.${fieldTimeGroupValue}`,
        label: fieldTimeGroupValue,
        description: undefined,
        hidden: false,
        required: false,
        isField: false,
        children: [fieldNode],
        nodeClass: FieldClassEnum.Dimension
      };

      topNode.children.push(newGroupNode);
    }
  } else if (
    [
      FieldResultEnum.String,
      FieldResultEnum.Number,
      FieldResultEnum.Boolean,
      FieldResultEnum.Ts
    ].indexOf(fieldNode.fieldResult) > -1
  ) {
    topNode.children.push(fieldNode);
  }

  let formatNumberTag = mproveTags?.find(tag => tag.key === 'format_number');

  let currencyPrefixTag = mproveTags?.find(
    tag => tag.key === ParameterEnum.CurrencyPrefix
  );

  let currencySuffixTag = mproveTags?.find(
    tag => tag.key === ParameterEnum.CurrencySuffix
  );

  let buildMetricsTag = mproveTags?.find(
    tag => tag.key === ParameterEnum.BuildMetrics
  );

  let isTimeframeBase =
    flatMalloyFieldItem.field.name.endsWith('_t') &&
    [FieldResultEnum.Ts, FieldResultEnum.Date].indexOf(result) > -1;

  let sourceExpression = flatMalloyFieldItem.sourceExpression;

  let sourceExpressionFieldPath =
    sourceExpression?.node === 'trunc' &&
    sourceExpression?.units === fieldType.timeframe &&
    sourceExpression?.e?.node === 'field'
      ? sourceExpression.e.path
      : undefined;

  let malloyBaseFieldId = isDefined(sourceExpressionFieldPath)
    ? [...flatMalloyFieldItem.path, ...sourceExpressionFieldPath].join('.')
    : undefined;

  let modelField: ModelField = {
    id: fieldId,
    malloyFieldName: flatMalloyFieldItem.field.name,
    malloyFieldPath: flatMalloyFieldItem.path,
    malloyBaseFieldId: malloyBaseFieldId,
    malloyTags: malloyTags,
    mproveTags: mproveTags,
    hidden: false,
    required: false,
    maxFractions: undefined,
    label: fieldLabel,
    fieldClass: fieldClass,
    fieldFileName: fileName,
    fieldFilePath: flatMalloyFieldItem.filePath,
    result: result,
    fieldLineNum: flatMalloyFieldItem.lineNum,
    formatNumber: formatNumberTag?.value,
    currencyPrefix: currencyPrefixTag?.value,
    currencySuffix: currencySuffixTag?.value,
    buildMetrics: isDefined(buildMetricsTag),
    isTimeframeBase: isTimeframeBase,
    timeframe: fieldType.timeframe,
    sqlName: fieldSqlName,
    topId: topNode.id,
    topLabel: topNode.label,
    description: undefined,
    type: undefined,
    groupId: undefined,
    groupLabel: undefined,
    groupDescription: undefined,
    suggestModelDimension: undefined,
    detail: undefined
  };

  return modelField;
}
