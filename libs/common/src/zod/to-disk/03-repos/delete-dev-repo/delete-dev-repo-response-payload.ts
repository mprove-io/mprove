import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteDevRepoResponsePayload = {
  orgId: string;
  projectId: string;
  deletedRepoId: string;
};

export let zToDiskDeleteDevRepoResponsePayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    deletedRepoId: z.string()
  })
  .meta({ id: 'ToDiskDeleteDevRepoResponsePayload' });

assertTypesEqual<
  ToDiskDeleteDevRepoResponsePayload,
  z.infer<typeof zToDiskDeleteDevRepoResponsePayload>
>({ value: true });
