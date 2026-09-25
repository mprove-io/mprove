import type { FieldInfo } from '@malloydata/malloy-interfaces';
import type { MalloySourceField } from '#blockml/types/malloy-source-field';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';

const EXPLORER_FILTER_FIELD_PREFIX: string = '#NO_UI';

const INDEX_FIELDS = [
  'fieldName',
  'fieldPath',
  'fieldValue',
  'fieldType',
  'fieldRange',
  'weight'
] as const;

export type MalloyFieldItem = {
  path: string[];
  field: FieldInfo;
  sourceField: MalloySourceField;
};

export function flattenMalloyFieldItemsRecursive(item: {
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
            ...flattenMalloyFieldItemsRecursive({
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
            ...flattenMalloyFieldItemsRecursive({
              sourceFields: nestedSourceFields,
              stableFields: nestedStableFields,
              path: [...item.path, stableField.name]
            })
          ];
        }

        return [fieldItem];
      }
      case 'join':
        return flattenMalloyFieldItemsRecursive({
          sourceFields: sourceField.fields || [],
          stableFields: stableField.schema.fields,
          path: [...item.path, stableField.name]
        });
      default:
        return [];
    }
  });
}
