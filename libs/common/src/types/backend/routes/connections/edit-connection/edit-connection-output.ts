import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectConnection,
  zProjectConnection
} from '#common/types/backend/parts/project-connection';

export type ToBackendEditConnectionOutput = {
  connection: ProjectConnection;
};

export let zToBackendEditConnectionOutput = z
  .object({
    connection: zProjectConnection
  })
  .meta({ id: 'ToBackendEditConnectionOutput' });

assertTypesEqual<
  ToBackendEditConnectionOutput,
  z.infer<typeof zToBackendEditConnectionOutput>
>({ value: true });
