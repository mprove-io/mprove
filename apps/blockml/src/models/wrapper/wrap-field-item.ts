import { AtomicType } from '@malloydata/malloy-interfaces';
import { common } from '~blockml/barrels/common';
import { FieldItem } from '~blockml/functions/source-to-field-items';
import { parseTagsAndFlags } from '~common/_index';

export function wrapFieldItem(item: {
  topNode: common.ModelNode;
  fieldItem: FieldItem;
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
      ? common.FieldResultEnum.String
      : typeKind === 'number_type'
        ? common.FieldResultEnum.Number
        : typeKind === 'boolean_type'
          ? common.FieldResultEnum.Boolean
          : typeKind === 'timestamp_type'
            ? common.FieldResultEnum.Timestamp
            : typeKind === 'date_type'
              ? common.FieldResultEnum.Date
              : typeKind === 'array_type'
                ? common.FieldResultEnum.Array
                : typeKind === 'record_type'
                  ? common.FieldResultEnum.Record
                  : typeKind === 'json_type'
                    ? common.FieldResultEnum.Json
                    : typeKind === 'sql_native_type'
                      ? common.FieldResultEnum.SqlNative
                      : undefined;

  let fieldClass =
    fieldItem.field.kind === 'dimension'
      ? common.FieldClassEnum.Dimension
      : fieldItem.field.kind === 'measure'
        ? common.FieldClassEnum.Measure
        : undefined;

  let fieldLabel = fieldItem.field.name
    .split('_')
    .map(k =>
      common.NO_CAPITALIZE_LIST.indexOf(k) < 0
        ? common.capitalizeFirstLetter(k)
        : k
    )
    .join(' ');

  let fieldSqlName = fieldItem.field.name;

  let { malloyTags, mproveTags, mproveFlags, malloyFlags } = parseTagsAndFlags({
    inputs: fieldItem.field.annotations?.map(x => x.value) || []
  });

  let fieldNode: common.ModelNode = {
    id: fieldId,
    label: fieldLabel,
    description: undefined,
    hidden: false,
    required: false,
    isField: true,
    children: [],
    fieldFileName: fileName,
    fieldFilePath: filePath,
    fieldResult: result,
    fieldLineNum: 0,
    nodeClass: fieldClass
  };

  let fieldGroupTag = mproveTags.find(
    x => x.key === common.MPROVE_TAG_FIELD_GROUP
  );

  let fieldTimeGroupValue = fieldGroupTag?.value;

  if (
    common.isDefined(fieldTimeGroupValue)
    //  && result === common.FieldResultEnum.Timestamp
  ) {
    let groupNode = topNode.children.find(
      c => c.id === `${alias}.${fieldTimeGroupValue}`
    );

    if (common.isDefined(groupNode)) {
      groupNode.children.push(fieldNode);
    } else {
      // let fieldParts: {
      //   id: string;
      //   // prefix: string;
      //   // suffix: string;
      //   label: string;
      //   result: common.FieldResultEnum;
      //   malloyTimeframe: TimestampTimeframe;
      // }[] = [
      //   {
      //     id: `${fieldId}`,
      //     // prefix: ``,
      //     // suffix: ``,
      //     label: `${fieldLabel} Timestamp`,
      //     result: common.FieldResultEnum.Timestamp,
      //     malloyTimeframe: undefined
      //   },
      //   {
      //     id: `${fieldId}__year`,
      //     // prefix: ``,
      //     // suffix: `.year`,
      //     label: `${fieldLabel} Year`,
      //     result: common.FieldResultEnum.Timestamp,
      //     malloyTimeframe: TimestampTimeframe.Year
      //   },
      //   {
      //     id: `${fieldId}__quarter`,
      //     // prefix: ``,
      //     // suffix: `.quarter`,
      //     label: `${fieldLabel} Quarter`,
      //     result: common.FieldResultEnum.Timestamp,
      //     malloyTimeframe: TimestampTimeframe.Quarter
      //   },
      //   // {
      //   //   id: `${fieldId}__day_of_week`,
      //   //   prefix: `day_of_week(`,
      //   //   suffix: `)`,
      //   //   label: `${fieldLabel} Day of Week`,
      //   //   result: common.FieldResultEnum.Number
      //   // },
      //   // {
      //   //   id: `${fieldId}__day_of_year`,
      //   //   prefix: `day_of_year(`,
      //   //   suffix: `)`,
      //   //   label: `${fieldLabel} Day of Year`,
      //   //   result: common.FieldResultEnum.Number
      //   // }
      // ];

      // let groupFieldNodes = [
      //   ...fieldParts.map(part => {
      //     let fieldNode: common.ModelNode = {
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

      let newGroupNode: common.ModelNode = {
        id: `${alias}.${fieldTimeGroupValue}`,
        label: fieldTimeGroupValue,
        description: undefined,
        hidden: false,
        required: false,
        isField: false,
        // children: groupFieldNodes,
        children: [fieldNode],
        nodeClass: common.FieldClassEnum.Dimension
      };

      topNode.children.push(newGroupNode);

      // modelFields = fieldParts.map(fieldPart => {
      //   let modelField: common.ModelField = {
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
      //     fieldClass: common.FieldClassEnum.Dimension,
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
  } else {
    topNode.children.push(fieldNode);
  }

  let modelField: common.ModelField = {
    id: fieldId,
    malloyFieldName: fieldItem.field.name,
    malloyFieldPath: fieldItem.path,
    malloyTags: malloyTags,
    mproveTags: mproveTags,
    malloyFlags: malloyFlags,
    mproveFlags: mproveFlags,
    hidden: false,
    required: false,
    maxFractions: undefined,
    label: fieldLabel,
    fieldClass: fieldClass,
    result: result,
    formatNumber: undefined,
    currencyPrefix: undefined,
    currencySuffix: undefined,
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
