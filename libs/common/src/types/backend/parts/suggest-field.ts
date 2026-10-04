import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionType,
  zConnectionType
} from '#common/types/backend/parts/connection-parts/connection-type';
import {
  type FieldClass,
  zFieldClass
} from '#common/types/blockml/parts/field/field-class';
import {
  type FieldResult,
  zFieldResult
} from '#common/types/blockml/parts/field/field-result';

export type SuggestField = {
  modelFieldRef: string;
  connectionType: ConnectionType;
  topLabel: string;
  partNodeLabel: string;
  partFieldLabel: string;
  partLabel: string;
  fieldClass: FieldClass;
  result: FieldResult;
};

export let zSuggestField = z
  .object({
    modelFieldRef: z.string(),
    connectionType: zConnectionType,
    topLabel: z.string(),
    partNodeLabel: z.string(),
    partFieldLabel: z.string(),
    partLabel: z.string(),
    fieldClass: zFieldClass,
    result: zFieldResult
  })
  .meta({ id: 'SuggestField' });

assertTypesEqual<SuggestField, z.infer<typeof zSuggestField>>({ value: true });
