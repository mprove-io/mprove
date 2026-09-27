import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetProjectRequest } from '#common/zod/backend/routes/projects/get-project/get-project-request';
import { zToBackendGetProjectResponse } from '#common/zod/backend/routes/projects/get-project/get-project-response';

export class ToBackendGetProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectRequest })
) {}

export class ToBackendGetProjectResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectResponse })
) {}
