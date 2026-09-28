import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateExplorerSessionOutput = {
  sessionId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export let zToBackendCreateExplorerSessionOutput = z
  .object({
    sessionId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendCreateExplorerSessionOutput' });

assertTypesEqual<
  ToBackendCreateExplorerSessionOutput,
  z.infer<typeof zToBackendCreateExplorerSessionOutput>
>({ value: true });
