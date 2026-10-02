import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendQueriesDoNotExistError = {
  code: 'BACKEND_QUERIES_DO_NOT_EXIST';
  displayData?: { notFoundQueryIds: string[] };
};

export let zBackendQueriesDoNotExistError = z.object({
  code: z.literal('BACKEND_QUERIES_DO_NOT_EXIST'),
  displayData: z.object({ notFoundQueryIds: z.array(z.string()) }).nullish()
});

assertTypesEqual<
  BackendQueriesDoNotExistError,
  z.infer<typeof zBackendQueriesDoNotExistError>
>({ value: true });
