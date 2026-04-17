import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetModelsRequest,
  zToBackendGetModelsResponse
} from '#common/zod/to-backend/models/to-backend-get-models';

export class ToBackendGetModelsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelsRequest })
) {}

export class ToBackendGetModelsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelsResponse })
) {}
