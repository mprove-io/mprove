import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetProjectInfoRequest,
  zToBackendSetProjectInfoResponse
} from '#common/zod/to-backend/projects/to-backend-set-project-info';

export class ToBackendSetProjectInfoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectInfoRequest })
) {}

export class ToBackendSetProjectInfoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectInfoResponse })
) {}
