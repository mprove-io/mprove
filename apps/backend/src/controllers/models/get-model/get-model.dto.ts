import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetModelRequest,
  zToBackendGetModelResponse
} from '#common/zod/to-backend/models/to-backend-get-model';

export class ToBackendGetModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelRequest })
) {}

export class ToBackendGetModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetModelResponse })
) {}
