import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type {
  ToDiskOperationRequest,
  ToDiskPilotRequest
} from './to-disk-operation-contract';

export type ToDiskLegacyRoute = {
  info: {
    name: Exclude<ToDiskOperationRequest, ToDiskPilotRequest>['info']['name'];
  };
};

// Only discriminate here; legacy services retain their request validation.
export let zToDiskLegacyRoute = z.object({
  info: z.object({
    name: z
      .enum(ToDiskRequestInfoNameEnum)
      .exclude(['ToDiskGetFile', 'ToDiskDeleteBranch'])
  })
});

assertTypesEqual<ToDiskLegacyRoute, z.infer<typeof zToDiskLegacyRoute>>({
  value: true
});
