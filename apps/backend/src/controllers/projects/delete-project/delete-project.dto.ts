import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteProjectRequest } from '#common/types/backend/routes/projects/delete-project/delete-project-request';
import { zToBackendDeleteProjectResponse } from '#common/types/backend/routes/projects/delete-project/delete-project-response';

export class ToBackendDeleteProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProjectRequest })
) {}

export class ToBackendDeleteProjectResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteProjectResponse }
) {}
