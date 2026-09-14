import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendEditGivenRequest,
  zToBackendEditGivenResponse
} from '#common/zod/to-backend/givens/to-backend-edit-given';

export class ToBackendEditGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditGivenRequest })
) {}

export class ToBackendEditGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditGivenResponse })
) {}
