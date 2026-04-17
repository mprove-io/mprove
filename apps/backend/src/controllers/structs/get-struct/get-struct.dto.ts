import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetStructRequest,
  zToBackendGetStructResponse
} from '#common/zod/to-backend/structs/to-backend-get-struct';

export class ToBackendGetStructRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStructRequest })
) {}

export class ToBackendGetStructResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStructResponse })
) {}
