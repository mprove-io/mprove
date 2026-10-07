import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetModelRequest } from '#common/types/backend/routes/models/get-model/get-model-request';
import { zToBackendGetModelResponse } from '#common/types/backend/routes/models/get-model/get-model-response';

export class ToBackendGetModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelRequest })
) {}

export class ToBackendGetModelResponseDto extends createBackendResponseDto({
  schema: zToBackendGetModelResponse
}) {}
