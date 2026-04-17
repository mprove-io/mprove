import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendIsProjectExistRequest,
  zToBackendIsProjectExistResponse
} from '#common/zod/to-backend/projects/to-backend-is-project-exist';

export class ToBackendIsProjectExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsProjectExistRequest })
) {}

export class ToBackendIsProjectExistResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsProjectExistResponse })
) {}
