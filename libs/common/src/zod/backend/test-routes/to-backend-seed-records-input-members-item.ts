import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsInputMembersItem = {
  projectId: string;
  email: string;
  memberId: string;
  roles?: string[];
  envs?: string[];
  isAdmin: boolean;
  isEditor: boolean;
  isExplorer: boolean;
};

export let zToBackendSeedRecordsInputMembersItem = z
  .object({
    projectId: z.string(),
    email: z.string(),
    memberId: z.string(),
    roles: z.array(z.string()).nullish(),
    envs: z.array(z.string()).nullish(),
    isAdmin: z.boolean(),
    isEditor: z.boolean(),
    isExplorer: z.boolean()
  })
  .meta({ id: 'ToBackendSeedRecordsInputMembersItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputMembersItem,
  z.infer<typeof zToBackendSeedRecordsInputMembersItem>
>({ value: true });
