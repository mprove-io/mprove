import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetProjectRequest } from '#common/types/backend/routes/projects/get-project/get-project-request';
import { zToBackendGetProjectResponse } from '#common/types/backend/routes/projects/get-project/get-project-response';

export class ToBackendGetProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectRequest })
) {}

export class ToBackendGetProjectResponseDto extends createBackendResponseDto({
  schema: zToBackendGetProjectResponse
}) {}
