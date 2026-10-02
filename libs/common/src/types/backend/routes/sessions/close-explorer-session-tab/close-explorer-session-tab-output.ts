import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCloseExplorerSessionTabOutput = Record<string, never>;

export let zToBackendCloseExplorerSessionTabOutput = z
  .object({})
  .meta({ id: 'ToBackendCloseExplorerSessionTabOutput' });

assertTypesEqual<
  ToBackendCloseExplorerSessionTabOutput,
  z.infer<typeof zToBackendCloseExplorerSessionTabOutput>
>({ value: true });
