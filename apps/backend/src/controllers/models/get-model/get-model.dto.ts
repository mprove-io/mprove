import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetModelRequest } from '#common/zod/backend/routes/models/get-model/get-model-request';
import { zToBackendGetModelResponse } from '#common/zod/backend/routes/models/get-model/get-model-response';

export class ToBackendGetModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelRequest })
) {}

export class ToBackendGetModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelResponse })
) {}
