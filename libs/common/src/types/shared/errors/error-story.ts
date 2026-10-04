import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const errorStoryValues = ['DefinedError', 'UnknownError'] as const;

export type ErrorStory = (typeof errorStoryValues)[number];

export let zErrorStory = z.enum(errorStoryValues);

assertTypesEqual<ErrorStory, z.infer<typeof zErrorStory>>({
  value: true
});
