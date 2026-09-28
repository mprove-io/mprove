import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEditorSessionOutput = {
  sessionId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export let zToBackendCreateEditorSessionOutput = z
  .object({
    sessionId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendCreateEditorSessionOutput' });

assertTypesEqual<
  ToBackendCreateEditorSessionOutput,
  z.infer<typeof zToBackendCreateEditorSessionOutput>
>({ value: true });
