import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Ui, zUi } from '#common/types/backend/ui';

export type ToBackendSetUserUiRequest = {
  operation: 'setUserUi';
  traceId: string;
  idempotencyKey: string;
  input: {
    ui: Ui;
  };
};

export let zToBackendSetUserUiRequest = z
  .strictObject({
    operation: z.literal('setUserUi'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        ui: zUi
      })
      .meta({ id: 'ToBackendSetUserUiInput' })
  })
  .meta({ id: 'ToBackendSetUserUiRequest' });

assertTypesEqual<
  ToBackendSetUserUiRequest,
  z.infer<typeof zToBackendSetUserUiRequest>
>({ value: true });
