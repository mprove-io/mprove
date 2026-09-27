import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetModelsRequest } from '#common/zod/backend/routes/models/get-models/get-models-request';
import { zToBackendGetModelsResponse } from '#common/zod/backend/routes/models/get-models/get-models-response';

export class ToBackendGetModelsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelsRequest })
) {}

export class ToBackendGetModelsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelsResponse })
) {}
