import { AtomicType } from '@malloydata/malloy-interfaces';
import {
  DOUBLE_UNDERSCORE,
  MPROVE_TAG_FIELD_GROUP,
  NO_CAPITALIZE_LIST
} from '~common/constants/top';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';
import { isDefined } from '~common/functions/is-defined';
import { parseTags } from '~common/functions/parse-tags';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelNode } from '~common/interfaces/blockml/model-node';
import { FieldItem } from '../extra/get-field-items';

export interface FieldItemX extends FieldItem {
  filePath: string;
  lineNum: number;
}

export function wrapFieldItem(item: {
  topNode: ModelNode;
  fieldItem: FieldItemX;
  alias: string;
  fileName: string;
  filePath: string;
}) {
  let { fieldItem, alias, fileName, filePath, topNode } = item;

  let fieldId = [...fieldItem.path, fieldItem.field.name].join('.');

  let typeKind = ((fieldItem.field as any).type as AtomicType).kind;

  // if (typeKind === 'timestamp_type') {
  //   console.log('fieldItem');
  //   console.dir(fieldItem, { depth: null });
  // }

  //   if (fieldItem.field.name === 'actual_cost_prep'
  // ||fieldItem.field.name === 'actual_cost'

  //   ) {
  // console.log('fieldItem');
  // console.dir(fieldItem, { depth: null });
  // }

  let result =
    typeKind === 'string_type'
      ? FieldResultEnum.String
      : typeKind === 'number_type'
        ? FieldResultEnum.Number
        : typeKind === 'boolean_type'
          ? FieldResultEnum.Boolean
          : typeKind === 'timestamp_type'
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
    fieldItem.field.kind === 'dimension'
      ? FieldClassEnum.Dimension
      : fieldItem.field.kind === 'measure'
        ? FieldClassEnum.Measure
        : undefined;

  let fieldLabel = fieldItem.field.name
    .split('_')
    .map(k =>
      NO_CAPITALIZE_LIST.indexOf(k) < 0 ? capitalizeFirstLetter(k) : k
    )
    .join(' ');

  // console.log('filePath');
  // console.log(filePath);

  // console.log('fieldItem');
  // console.log(fieldItem);

  let fieldSqlName =
    fieldItem.path.length > 0
      ? fieldItem.path.join(DOUBLE_UNDERSCORE) +
        DOUBLE_UNDERSCORE +
        fieldItem.field.name
      : fieldItem.field.name;

  let { malloyTags, mproveTags } = parseTags({
    inputs: fieldItem.field.annotations?.map(x => x.value) || []
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
    fieldFilePath: fieldItem.filePath,
    fieldResult: result,
    fieldLineNum: fieldItem.lineNum,
    nodeClass: fieldClass
  };

  let fieldGroupTag = mproveTags.find(x => x.key === MPROVE_TAG_FIELD_GROUP);

  let fieldTimeGroupValue = fieldGroupTag?.value;

  if (
    isDefined(fieldTimeGroupValue)
    //  && result === FieldResultEnum.Timestamp
  ) {
    let groupNode = topNode.children.find(
      c => c.id === `${alias}.${fieldTimeGroupValue}`
    );

    if (isDefined(groupNode)) {
      groupNode.children.push(fieldNode);
    } else {
      // let fieldParts: {
      //   id: string;
      //   // prefix: string;
      //   // suffix: string;
      //   label: string;
      //   result: FieldResultEnum;
      //   malloyTimeframe: TimestampTimeframe;
      // }[] = [
      //   {
      //     id: `${fieldId}`,
      //     // prefix: ``,
      //     // suffix: ``,
      //     label: `${fieldLabel} Timestamp`,
      //     result: FieldResultEnum.Timestamp,
      //     malloyTimeframe: undefined
      //   },
      //   {
      //     id: `${fieldId}__year`,
      //     // prefix: ``,
      //     // suffix: `.year`,
      //     label: `${fieldLabel} Year`,
      //     result: FieldResultEnum.Timestamp,
      //     malloyTimeframe: TimestampTimeframe.Year
      //   },
      //   {
      //     id: `${fieldId}__quarter`,
      //     // prefix: ``,
      //     // suffix: `.quarter`,
      //     label: `${fieldLabel} Quarter`,
      //     result: FieldResultEnum.Timestamp,
      //     malloyTimeframe: TimestampTimeframe.Quarter
      //   },
      //   // {
      //   //   id: `${fieldId}__day_of_week`,
      //   //   prefix: `day_of_week(`,
      //   //   suffix: `)`,
      //   //   label: `${fieldLabel} Day of Week`,
      //   //   result: FieldResultEnum.Number
      //   // },
      //   // {
      //   //   id: `${fieldId}__day_of_year`,
      //   //   prefix: `day_of_year(`,
      //   //   suffix: `)`,
      //   //   label: `${fieldLabel} Day of Year`,
      //   //   result: FieldResultEnum.Number
      //   // }
      // ];

      // let groupFieldNodes = [
      //   ...fieldParts.map(part => {
      //     let fieldNode: ModelNode = {
      //       id: part.id,
      //       label: part.label,
      //       description: undefined,
      //       hidden: false,
      //       required: false,
      //       isField: true,
      //       children: [],
      //       fieldFileName: fileName,
      //       fieldFilePath: filePath,
      //       fieldResult: result,
      //       fieldLineNum: 0,
      //       nodeClass: fieldClass
      //     };

      //     return fieldNode;
      //   })
      // ];

      let newGroupNode: ModelNode = {
        id: `${alias}.${fieldTimeGroupValue}`,
        label: fieldTimeGroupValue,
        description: undefined,
        hidden: false,
        required: false,
        isField: false,
        // children: groupFieldNodes,
        children: [fieldNode],
        nodeClass: FieldClassEnum.Dimension
      };

      topNode.children.push(newGroupNode);

      // modelFields = fieldParts.map(fieldPart => {
      //   let modelField: ModelField = {
      //     id: fieldPart.id,
      //     malloyFieldName: fieldItem.field.name,
      //     malloyFieldPath: fieldItem.path,
      //     // malloyTimeframe: fieldPart.malloyTimeframe,
      //     // malloyFieldPrefix: fieldPart.prefix,
      //     // malloyFieldSuffix: fieldPart.suffix,
      //     hidden: false,
      //     required: false,
      //     maxFractions: undefined,
      //     label: fieldPart.label,
      //     fieldClass: FieldClassEnum.Dimension,
      //     result: fieldPart.result,
      //     formatNumber: undefined,
      //     currencyPrefix: undefined,
      //     currencySuffix: undefined,
      //     sqlName: fieldSqlName,
      //     topId: topNode.id,
      //     topLabel: topNode.label,
      //     description: undefined,
      //     type: undefined,
      //     groupId: fieldTimeGroupValue,
      //     groupLabel: fieldTimeGroupValue,
      //     groupDescription: undefined,
      //     suggestModelDimension: undefined,
      //     detail: undefined
      //   };

      //   return modelField;
      // });
    }
  } else if (
    [
      FieldResultEnum.String,
      FieldResultEnum.Number,
      FieldResultEnum.Boolean,
      FieldResultEnum.Ts,
      FieldResultEnum.Date
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

  let modelField: ModelField = {
    id: fieldId,
    malloyFieldName: fieldItem.field.name,
    malloyFieldPath: fieldItem.path,
    malloyTags: malloyTags,
    mproveTags: mproveTags,
    hidden: false,
    required: false,
    maxFractions: undefined,
    label: fieldLabel,
    fieldClass: fieldClass,
    result: result,
    formatNumber: formatNumberTag?.value,
    currencyPrefix: currencyPrefixTag?.value,
    currencySuffix: currencySuffixTag?.value,
    buildMetrics: isDefined(buildMetricsTag),
    timeframe: (fieldItem?.field as any)?.type?.timeframe,
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

  // if (modelField.id.includes('most_expensive_item')) {
  //   console.log('mproveTags');
  //   console.log(mproveTags);

  //   console.log('malloyTags');
  //   console.log(malloyTags);

  //   console.log('modelField');
  //   console.log(modelField);
  // }

  return modelField;
}
