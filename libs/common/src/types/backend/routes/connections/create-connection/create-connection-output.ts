import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectConnection,
  zProjectConnection
} from '#common/types/backend/parts/project-connection';

export type ToBackendCreateConnectionOutput = {
  connection: ProjectConnection;
};

export let zToBackendCreateConnectionOutput = z
  .object({
    connection: zProjectConnection
  })
  .meta({ id: 'ToBackendCreateConnectionOutput' });

assertTypesEqual<
  ToBackendCreateConnectionOutput,
  z.infer<typeof zToBackendCreateConnectionOutput>
>({ value: true });
