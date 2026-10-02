import { z } from 'zod';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectWeekStartRequest = {
  operation: 'setProjectWeekStart';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    weekStart: ProjectWeekStartEnum.Sunday | ProjectWeekStartEnum.Monday;
  };
};

export let zToBackendSetProjectWeekStartRequest = z
  .strictObject({
    operation: z.literal('setProjectWeekStart'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        weekStart: z.enum(ProjectWeekStartEnum)
      })
      .meta({ id: 'ToBackendSetProjectWeekStartInput' })
  })
  .meta({ id: 'ToBackendSetProjectWeekStartRequest' });

assertTypesEqual<
  ToBackendSetProjectWeekStartRequest,
  z.infer<typeof zToBackendSetProjectWeekStartRequest>
>({ value: true });
