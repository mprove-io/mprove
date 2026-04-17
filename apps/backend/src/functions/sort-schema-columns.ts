import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import type { CombinedSchemaColumn } from '#common/zod/backend/connection-schemas/combined-schema';

export function sortSchemaColumns(item: {
  columns: CombinedSchemaColumn[];
}): CombinedSchemaColumn[] {
  let { columns } = item;

  let hasPrimaryKey = columns.some(col => col.isPrimaryKey === true);

  let topColumnName: string;

  if (hasPrimaryKey) {
    let pkColumns = columns
      .filter(col => col.isPrimaryKey === true)
      .sort((a, b) => a.columnName.localeCompare(b.columnName));
    topColumnName = pkColumns[0]?.columnName;
  } else {
    let oneToManyColumns = columns
      .filter(col =>
        col.references?.some(
          ref => ref.relationshipType === RelationshipTypeEnum.OneToMany
        )
      )
      .sort((a, b) => a.columnName.localeCompare(b.columnName));
    topColumnName = oneToManyColumns[0]?.columnName;
  }

  let sorted = columns.slice().sort((a, b) => {
    let aIsTop = a.columnName === topColumnName;
    let bIsTop = b.columnName === topColumnName;
    if (aIsTop && !bIsTop) return -1;
    if (!aIsTop && bIsTop) return 1;

    let aHasRelOrFk =
      (a.references?.length > 0 ? true : false) ||
      (a.foreignKeys?.length > 0 ? true : false);
    let bHasRelOrFk =
      (b.references?.length > 0 ? true : false) ||
      (b.foreignKeys?.length > 0 ? true : false);

    if (aHasRelOrFk && !bHasRelOrFk) return -1;
    if (!aHasRelOrFk && bHasRelOrFk) return 1;

    return a.columnName.localeCompare(b.columnName);
  });

  return sorted;
}
