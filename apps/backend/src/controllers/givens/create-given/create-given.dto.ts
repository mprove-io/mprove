import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendCreateGivenRequest,
  zToBackendCreateGivenResponse
} from '#common/zod/to-backend/givens/to-backend-create-given';

export class ToBackendCreateGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateGivenRequest })
) {}

export class ToBackendCreateGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateGivenResponse })
) {}
