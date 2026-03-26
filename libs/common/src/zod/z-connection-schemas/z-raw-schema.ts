export let zRawSchemaForeignKey = z.object({
  constraintName: z.string(),
  referencedSchemaName: z.string(),
  referencedTableName: z.string(),
  referencedColumnName: z.string()
});

export let zRawSchemaIndex = z.object({
  indexName: z.string(),
  indexColumns: z.array(z.string()),
  isUnique: z.boolean(),
  isPrimaryKey: z.boolean()
});
