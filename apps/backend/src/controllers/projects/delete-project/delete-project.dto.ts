import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteProjectRequest,
  zToBackendDeleteProjectResponse
} from '#common/zod/to-backend/projects/to-backend-delete-project';

export class ToBackendDeleteProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProjectRequest })
) {}

export class ToBackendDeleteProjectResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProjectResponse })
) {}
