import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteProjectRequest } from '#common/zod/backend/routes/projects/delete-project/delete-project-request';
import { zToBackendDeleteProjectResponse } from '#common/zod/backend/routes/projects/delete-project/delete-project-response';

export class ToBackendDeleteProjectRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProjectRequest })
) {}

export class ToBackendDeleteProjectResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProjectResponse })
) {}
