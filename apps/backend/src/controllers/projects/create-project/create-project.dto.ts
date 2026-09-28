import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateProjectRequest } from '#common/zod/backend/routes/projects/create-project/create-project-request';
import { zToBackendCreateProjectResponse } from '#common/zod/backend/routes/projects/create-project/create-project-response';

export class ToBackendCreateProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProjectRequest })
) {}

export class ToBackendCreateProjectResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateProjectResponse }
) {}
