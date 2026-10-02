import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskDeleteProjectOutput = {
  orgId: string;
  deletedProjectId: string;
};

export let zToDiskDeleteProjectOutput = z
  .object({
    orgId: z.string(),
    deletedProjectId: z.string()
  })
  .meta({ id: 'ToDiskDeleteProjectOutput' });

assertTypesEqual<
  ToDiskDeleteProjectOutput,
  z.infer<typeof zToDiskDeleteProjectOutput>
>({ value: true });
