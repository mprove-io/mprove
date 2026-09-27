import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Ui, zUi } from '#common/zod/backend/ui';

export type ToBackendSetUserUiInput = {
  ui: Ui;
};

export type ToBackendSetUserUiRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetUserUiInput;
};

export let zToBackendSetUserUiInput = z
  .object({
    ui: zUi
  })
  .meta({ id: 'ToBackendSetUserUiInput' });

export let zToBackendSetUserUiRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetUserUiInput
  })
  .meta({ id: 'ToBackendSetUserUiRequest' });

assertTypesEqual<
  ToBackendSetUserUiInput,
  z.infer<typeof zToBackendSetUserUiInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetUserUiRequest,
  z.infer<typeof zToBackendSetUserUiRequest>
>({ value: true });
