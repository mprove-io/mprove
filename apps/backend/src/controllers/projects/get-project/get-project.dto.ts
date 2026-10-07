import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetProjectRequest } from '#common/types/backend/routes/projects/get-project/get-project-request';
import { zToBackendGetProjectResponse } from '#common/types/backend/routes/projects/get-project/get-project-response';

export class ToBackendGetProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectRequest })
) {}

export class ToBackendGetProjectResponseDto extends createBackendResponseDto({
  schema: zToBackendGetProjectResponse
}) {}
