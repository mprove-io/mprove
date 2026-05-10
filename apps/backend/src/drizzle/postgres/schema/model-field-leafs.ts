import type { FieldDef as MalloyFieldDef } from '@malloydata/malloy';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FieldTypeEnum } from '#common/enums/field-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import type { KeyValuePair } from '#common/zod/blockml/key-value-pair';
import type { ModelField } from '#common/zod/blockml/model-field';

export const modelFieldLeafsTable = pgTable(
  'model_field_leafs',
  {
    modelFieldLeafFullId: varchar('model_field_leaf_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id').notNull(),
    modelId: varchar('model_id').notNull(),
    modelType: varchar('model_type').$type<ModelTypeEnum>().notNull(),
    connectionId: varchar('connection_id'),
    connectionType: varchar('connection_type').$type<ConnectionTypeEnum>(),
    fieldId: text('field_id').notNull(),
    fieldNameLc: text('field_name_lc'),
    fieldPath: json('field_path').$type<string[]>(),
    fieldClass: varchar('field_class').$type<FieldClassEnum>(),
    fieldResult: varchar('field_result').$type<FieldResultEnum>(),
    fieldType: varchar('field_type').$type<FieldTypeEnum>(),
    labelLc: text('label_lc'),
    descriptionLc: text('description_lc'),
    hidden: boolean('hidden'),
    required: boolean('required'),
    sqlNameLc: text('sql_name_lc'),
    topId: text('top_id'),
    topLabel: text('top_label'),
    groupId: text('group_id'),
    groupLabel: text('group_label'),
    malloyFieldNameLc: text('malloy_field_name_lc'),
    malloyFieldPath: json('malloy_field_path').$type<string[]>(),
    malloyTags: json('malloy_tags').$type<KeyValuePair[]>(),
    mproveTags: json('mprove_tags').$type<KeyValuePair[]>(),
    schemaNameLc: text('schema_name_lc'),
    tableNameLc: text('table_name_lc'),
    columnNameLc: text('column_name_lc'),
    field: json('field').$type<ModelField>().notNull(),
    malloyFieldDef: json('malloy_field_def').$type<MalloyFieldDef>(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxModelFieldLeafsStructId: index('idx_model_field_leafs_struct_id').on(
      table.structId
    ),
    idxModelFieldLeafsModelId: index('idx_model_field_leafs_model_id').on(
      table.modelId
    ),
    idxModelFieldLeafsModelType: index('idx_model_field_leafs_model_type').on(
      table.modelType
    ),
    idxModelFieldLeafsFieldId: index('idx_model_field_leafs_field_id').on(
      table.fieldId
    ),
    idxModelFieldLeafsConnectionId: index(
      'idx_model_field_leafs_connection_id'
    ).on(table.connectionId),
    idxModelFieldLeafsSchemaNameLc: index(
      'idx_model_field_leafs_schema_name_lc'
    ).on(table.schemaNameLc),
    idxModelFieldLeafsTableNameLc: index(
      'idx_model_field_leafs_table_name_lc'
    ).on(table.tableNameLc),
    idxModelFieldLeafsColumnNameLc: index(
      'idx_model_field_leafs_column_name_lc'
    ).on(table.columnNameLc),
    idxModelFieldLeafsServerTs: index('idx_model_field_leafs_server_ts').on(
      table.serverTs
    ),
    idxModelFieldLeafsStructTypeResult: index(
      'idx_model_field_leafs_struct_type_result'
    ).on(table.structId, table.modelType, table.fieldResult),
    uidxModelFieldLeafsStructModelField: uniqueIndex(
      'uidx_model_field_leafs_struct_model_field'
    ).on(table.structId, table.modelId, table.fieldId),
    trgmModelFieldLeafsFieldNameLc: index(
      'trgm_model_field_leafs_field_name_lc'
    ).using('gin', table.fieldNameLc.op('gin_trgm_ops')),
    trgmModelFieldLeafsFieldId: index('trgm_model_field_leafs_field_id').using(
      'gin',
      table.fieldId.op('gin_trgm_ops')
    ),
    trgmModelFieldLeafsMalloyFieldNameLc: index(
      'trgm_model_field_leafs_malloy_field_name_lc'
    ).using('gin', table.malloyFieldNameLc.op('gin_trgm_ops')),
    trgmModelFieldLeafsSqlNameLc: index(
      'trgm_model_field_leafs_sql_name_lc'
    ).using('gin', table.sqlNameLc.op('gin_trgm_ops')),
    trgmModelFieldLeafsLabelLc: index('trgm_model_field_leafs_label_lc').using(
      'gin',
      table.labelLc.op('gin_trgm_ops')
    ),
    trgmModelFieldLeafsDescriptionLc: index(
      'trgm_model_field_leafs_description_lc'
    ).using('gin', table.descriptionLc.op('gin_trgm_ops'))
  })
);

export type ModelFieldLeafEnt = InferSelectModel<typeof modelFieldLeafsTable>;
export type ModelFieldLeafEntIns = InferInsertModel<
  typeof modelFieldLeafsTable
>;
