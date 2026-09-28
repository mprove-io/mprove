import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGenerateProjectRemoteKeyOutput = {
  noteId: string;
  publicKey: string;
};

export let zToBackendGenerateProjectRemoteKeyOutput = z
  .object({
    noteId: z.string(),
    publicKey: z.string()
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyOutput' });

assertTypesEqual<
  ToBackendGenerateProjectRemoteKeyOutput,
  z.infer<typeof zToBackendGenerateProjectRemoteKeyOutput>
>({ value: true });
