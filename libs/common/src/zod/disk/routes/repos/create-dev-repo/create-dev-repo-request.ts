import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskCreateDevRepoRequest = {
  operation: 'createDevRepo';
  traceId: string;
  input: {
    baseProject: BaseProject;
    devRepoId: string;
    initialBranch?: string;
    sessionBranch?: string;
  };
};

export let zToDiskCreateDevRepoRequest = z
  .strictObject({
    operation: z.literal('createDevRepo'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        devRepoId: z.string(),
        initialBranch: z.string().nullish(),
        sessionBranch: z.string().nullish()
      })
      .meta({ id: 'ToDiskCreateDevRepoRequestInput' })
  })
  .meta({ id: 'ToDiskCreateDevRepoRequest' });

assertTypesEqual<
  ToDiskCreateDevRepoRequest,
  z.infer<typeof zToDiskCreateDevRepoRequest>
>({ value: true });
