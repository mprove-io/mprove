import { z } from 'zod';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';

export let zExtraSchemaRelationship = z
  .object({
    to: z.string(),
    toSchema: z.string().nullish(),
    type: z.enum(RelationshipTypeEnum)
  })
  .meta({ id: 'ExtraSchemaRelationship' });

export let zExtraSchemaColumn = z
  .object({
    column: z.string(),
    description: z.string().nullish(),
    example: z.string().nullish(),
    relationships: z.array(zExtraSchemaRelationship)
  })
  .meta({ id: 'ExtraSchemaColumn' });

export let zExtraSchemaTable = z
  .object({
    table: z.string(),
    description: z.string().nullish(),
    columns: z.array(zExtraSchemaColumn)
  })
  .meta({ id: 'ExtraSchemaTable' });

export let zExtraSchema = z
  .object({
    schema: z.string(),
    description: z.string().nullish(),
    tables: z.array(zExtraSchemaTable)
  })
  .meta({ id: 'ExtraSchema' });

export type ExtraSchemaRelationship = z.infer<typeof zExtraSchemaRelationship>;
export type ExtraSchemaColumn = z.infer<typeof zExtraSchemaColumn>;
export type ExtraSchemaTable = z.infer<typeof zExtraSchemaTable>;
export type ExtraSchema = z.infer<typeof zExtraSchema>;
