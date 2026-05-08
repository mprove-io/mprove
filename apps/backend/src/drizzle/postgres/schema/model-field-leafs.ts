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
    fieldName: text('field_name'),
    fieldPath: json('field_path').$type<string[]>(),
    fieldClass: varchar('field_class').$type<FieldClassEnum>(),
    fieldResult: varchar('field_result').$type<FieldResultEnum>(),
    fieldType: varchar('field_type').$type<FieldTypeEnum>(),
    label: text('label'),
    description: text('description'),
    hidden: boolean('hidden'),
    required: boolean('required'),
    sqlName: text('sql_name'),
    topId: text('top_id'),
    topLabel: text('top_label'),
    groupId: text('group_id'),
    groupLabel: text('group_label'),
    malloyFieldName: text('malloy_field_name'),
    malloyFieldPath: json('malloy_field_path').$type<string[]>(),
    malloyTags: json('malloy_tags').$type<KeyValuePair[]>(),
    mproveTags: json('mprove_tags').$type<KeyValuePair[]>(),
    schemaName: text('schema_name'),
    tableName: text('table_name'),
    columnName: text('column_name'),
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
    idxModelFieldLeafsSchemaName: index('idx_model_field_leafs_schema_name').on(
      table.schemaName
    ),
    idxModelFieldLeafsTableName: index('idx_model_field_leafs_table_name').on(
      table.tableName
    ),
    idxModelFieldLeafsColumnName: index('idx_model_field_leafs_column_name').on(
      table.columnName
    ),
    idxModelFieldLeafsServerTs: index('idx_model_field_leafs_server_ts').on(
      table.serverTs
    ),
    uidxModelFieldLeafsStructModelField: uniqueIndex(
      'uidx_model_field_leafs_struct_model_field'
    ).on(table.structId, table.modelId, table.fieldId)
  })
);

export type ModelFieldLeafEnt = InferSelectModel<typeof modelFieldLeafsTable>;
export type ModelFieldLeafEntIns = InferInsertModel<
  typeof modelFieldLeafsTable
>;
