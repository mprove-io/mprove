import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetModelsRequest } from '#common/types/backend/routes/models/get-models/get-models-request';
import { zToBackendGetModelsResponse } from '#common/types/backend/routes/models/get-models/get-models-response';

export class ToBackendGetModelsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelsRequest })
) {}

export class ToBackendGetModelsResponseDto extends createBackendResponseDto({
  schema: zToBackendGetModelsResponse
}) {}
