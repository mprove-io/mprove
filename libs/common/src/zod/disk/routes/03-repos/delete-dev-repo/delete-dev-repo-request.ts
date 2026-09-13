import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskDeleteDevRepoRequest = {
  operation: 'deleteDevRepo';
  traceId: string;
  input: {
    baseProject: BaseProject;
    devRepoId: string;
  };
};

export let zToDiskDeleteDevRepoRequest = z
  .strictObject({
    operation: z.literal('deleteDevRepo'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        devRepoId: z.string()
      })
      .meta({ id: 'ToDiskDeleteDevRepoRequestInput' })
  })
  .meta({ id: 'ToDiskDeleteDevRepoRequest' });

assertTypesEqual<
  ToDiskDeleteDevRepoRequest,
  z.infer<typeof zToDiskDeleteDevRepoRequest>
>({ value: true });
