import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongMotherduckDatabaseCharactersError = {
  code: 'BACKEND_WRONG_MOTHERDUCK_DATABASE_CHARACTERS';
};

export let zBackendWrongMotherduckDatabaseCharactersError = z.object({
  code: z.literal('BACKEND_WRONG_MOTHERDUCK_DATABASE_CHARACTERS')
});

assertTypesEqual<
  BackendWrongMotherduckDatabaseCharactersError,
  z.infer<typeof zBackendWrongMotherduckDatabaseCharactersError>
>({ value: true });
