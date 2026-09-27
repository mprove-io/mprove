import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ServerUsersMembershipItem = {
  orgId: string;
  isOrgOwner: boolean;
  projectId: string;
  isAdmin: boolean;
  isFileEditor: boolean;
  isExplorer: boolean;
};

export let zServerUsersMembershipItem = z
  .object({
    orgId: z.string(),
    isOrgOwner: z.boolean(),
    projectId: z.string(),
    isAdmin: z.boolean(),
    isFileEditor: z.boolean(),
    isExplorer: z.boolean()
  })
  .meta({ id: 'ServerUsersMembershipItem' });

assertTypesEqual<
  ServerUsersMembershipItem,
  z.infer<typeof zServerUsersMembershipItem>
>({ value: true });
