import { z } from 'zod';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';

export let zFileSchemaRelationship = z
  .object({
    to: z.string().nullish(),
    to_line_num: z.number().nullish(),
    to_schema: z.string().nullish(),
    to_schema_line_num: z.number().nullish(),
    type: z.enum(RelationshipTypeEnum).nullish(),
    type_line_num: z.number().nullish()
  })
  .meta({ id: 'FileSchemaRelationship' });

export type FileSchemaRelationship = z.infer<typeof zFileSchemaRelationship>;
