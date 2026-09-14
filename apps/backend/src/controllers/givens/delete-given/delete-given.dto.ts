import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendDeleteGivenRequest,
  zToBackendDeleteGivenResponse
} from '#common/zod/to-backend/givens/to-backend-delete-given';

export class ToBackendDeleteGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteGivenRequest })
) {}

export class ToBackendDeleteGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteGivenResponse })
) {}
