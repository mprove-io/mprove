import type { AtomicType } from '@malloydata/malloy-interfaces';
import { parseTags } from '#blockml/functions/parse-tags/parse-tags';
import {
  DOUBLE_UNDERSCORE,
  MPROVE_TAG_FIELD_GROUP,
  NO_CAPITALIZE_LIST
} from '#common/constants/top';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FieldClass } from '#common/types/blockml/parts/field/field-class';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { FlatMalloyFieldItem } from '#common/types/blockml/parts/internal/flat-malloy-field-item';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { ModelNode } from '#common/types/blockml/parts/model/model-node';

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

  let result: FieldResult =
    typeKind === 'string_type'
      ? 'string'
      : typeKind === 'number_type'
        ? 'number'
        : typeKind === 'boolean_type'
          ? 'boolean'
          : typeKind === 'timestamp_type' || typeKind === 'timestamptz_type'
            ? 'ts'
            : typeKind === 'date_type'
              ? 'date'
              : typeKind === 'array_type'
                ? 'array'
                : typeKind === 'record_type'
                  ? 'record'
                  : typeKind === 'json_type'
                    ? 'json'
                    : typeKind === 'sql_native_type'
                      ? 'sql_native'
                      : undefined;

  let fieldClass: FieldClass =
    flatMalloyFieldItem.field.kind === 'dimension'
      ? 'dimension'
      : flatMalloyFieldItem.field.kind === 'measure'
        ? 'measure'
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
        nodeClass: 'dimension'
      };

      topNode.children.push(newGroupNode);
    }
  } else if (
    ['string', 'number', 'boolean', 'ts'].indexOf(fieldNode.fieldResult) > -1
  ) {
    topNode.children.push(fieldNode);
  }

  let formatNumberTag = mproveTags?.find(tag => tag.key === 'format_number');

  let currencyPrefixTag = mproveTags?.find(
    tag => tag.key === 'currency_prefix'
  );

  let currencySuffixTag = mproveTags?.find(
    tag => tag.key === 'currency_suffix'
  );

  let buildMetricsTag = mproveTags?.find(tag => tag.key === 'build_metrics');

  let isTimeframeBase =
    flatMalloyFieldItem.field.name.endsWith('_t') &&
    ['ts', 'date'].indexOf(result) > -1;

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
