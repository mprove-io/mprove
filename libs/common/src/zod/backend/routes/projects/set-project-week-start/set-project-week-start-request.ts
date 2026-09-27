import { z } from 'zod';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectWeekStartInput = {
  projectId: string;
  weekStart: ProjectWeekStartEnum.Sunday | ProjectWeekStartEnum.Monday;
};

export type ToBackendSetProjectWeekStartRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetProjectWeekStartInput;
};

export let zToBackendSetProjectWeekStartInput = z
  .object({
    projectId: z.string(),
    weekStart: z.enum(ProjectWeekStartEnum)
  })
  .meta({ id: 'ToBackendSetProjectWeekStartInput' });

export let zToBackendSetProjectWeekStartRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetProjectWeekStartInput
  })
  .meta({ id: 'ToBackendSetProjectWeekStartRequest' });

assertTypesEqual<
  ToBackendSetProjectWeekStartInput,
  z.infer<typeof zToBackendSetProjectWeekStartInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectWeekStartRequest,
  z.infer<typeof zToBackendSetProjectWeekStartRequest>
>({ value: true });
