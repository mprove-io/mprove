import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateProjectRequest,
  zToBackendCreateProjectResponse
} from '#common/zod/to-backend/projects/to-backend-create-project';

export class ToBackendCreateProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProjectRequest })
) {}

export class ToBackendCreateProjectResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProjectResponse })
) {}
