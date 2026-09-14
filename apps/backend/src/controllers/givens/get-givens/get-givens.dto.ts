import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendGetGivensRequest,
  zToBackendGetGivensResponse
} from '#common/zod/to-backend/givens/to-backend-get-givens';

export class ToBackendGetGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetGivensRequest })
) {}

export class ToBackendGetGivensResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetGivensResponse })
) {}
