import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type ToDiskInvalidRequest,
  zToDiskInvalidRequest
} from './to-disk-invalid-request';

// No operation metadata can be claimed when the request cannot be routed.
export type ToDiskUnrouteableResponse = {
  result: ToDiskInvalidRequest;
};

export let zToDiskUnrouteableResponse = z.object({
  result: zToDiskInvalidRequest
});

assertTypesEqual<
  ToDiskUnrouteableResponse,
  z.infer<typeof zToDiskUnrouteableResponse>
>({ value: true });
