import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetProjectRequest,
  zToBackendGetProjectResponse
} from '#common/zod/to-backend/projects/to-backend-get-project';

export class ToBackendGetProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectRequest })
) {}

export class ToBackendGetProjectResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectResponse })
) {}
