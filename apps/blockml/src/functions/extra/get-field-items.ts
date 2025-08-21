import {
  Annotation,
  FieldInfo,
  FieldInfoWithView,
  SourceInfo
} from '@malloydata/malloy-interfaces';

// malloy-explore

export type FieldItem = {
  path: string[];
  field: FieldInfo;
};

export type FieldGroupByPath = {
  groupPath: string[];
  items: FieldItem[];
};

export type FieldGroupByKind = {
  group: 'view' | 'measure' | 'dimension';
  items: FieldItem[];
};

export function getFieldItems(sourceInfo: SourceInfo) {
  return sourceToFieldItems(sourceInfo).filter(
    fi => !hasExplorerFilterFieldAnnotation(fi.field.annotations ?? [])
  );
}

function sourceToFieldItems(source: SourceInfo): FieldItem[] {
  return flattenFieldsTree(source.schema.fields);
}

const EXPLORER_FILTER_FIELD_PREFIX: string = '#NO_UI';

const hasExplorerFilterFieldAnnotation = (
  annotations: Array<Annotation>
): boolean => {
  const filter_field_annotation = annotations.find(a =>
    a.value.startsWith(EXPLORER_FILTER_FIELD_PREFIX)
  );

  return !!filter_field_annotation;
};

function flattenFieldsTree(
  fields: FieldInfo[],
  path: string[] = []
): FieldItem[] {
  return fields.flatMap<FieldItem>(field => {
    switch (field.kind) {
      case 'view':
        if (isIndexView(field)) {
          return [];
        } else if (path.length > 0) {
          return []; // exclude views in join fields
        } else {
          return [{ path, field }];
        }
      case 'measure':
      case 'dimension':
        if (
          field.type.kind === 'array_type' &&
          field.type.element_type.kind === 'record_type'
        ) {
          return [
            { path, field },
            ...flattenFieldsTree(
              field.type.element_type.fields.map(dimension => ({
                kind: field.kind,
                ...dimension
              })),
              [...path, field.name]
            )
          ];
        } else if (field.type.kind === 'record_type') {
          return [
            { path, field },
            ...flattenFieldsTree(
              field.type.fields.map(dimension => ({
                kind: field.kind,
                ...dimension
              })),
              [...path, field.name]
            )
          ];
        }
        return [{ path, field }];
      case 'join':
        return flattenFieldsTree(field.schema.fields, [...path, field.name]);
      default:
        return [];
    }
  });
}

const INDEX_FIELDS = [
  'fieldName',
  'fieldPath',
  'fieldValue',
  'fieldType',
  'fieldRange',
  'weight'
] as const;

function isIndexView(field: FieldInfoWithView) {
  const allFields = new Set([
    ...INDEX_FIELDS,
    ...field.schema.fields.map(field => field.name)
  ]);
  // Complete overlap of fields
  return allFields.size === INDEX_FIELDS.length;
}

// function groupFieldItemsByPath(
//   source: SourceInfo,
//   items: FieldItem[]
// ): FieldGroupByPath[] {
//   return Object.values(
//     items.reduce((acc: Record<string, FieldGroupByPath>, current) => {
//       const groupKey = [source.name, ...current.path].join('.');
//       if (!acc[groupKey]) {
//         acc[groupKey] = {
//           groupPath: current.path,
//           items: []
//         };
//       }
//       acc[groupKey].items.push(current);
//       return acc;
//     }, {})
//   );
// }

// function groupFieldItemsByKind(items: FieldItem[]): FieldGroupByKind[] {
//   return Object.values(
//     items.reduce((acc: Record<string, FieldGroupByKind>, current) => {
//       const kind = current.field.kind as 'view' | 'measure' | 'dimension';
//       if (!acc[kind]) {
//         acc[kind] = { group: kind, items: [] };
//       }
//       acc[kind].items.push(current);
//       return acc;
//     }, {})
//   );
// }
