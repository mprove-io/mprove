import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetProjectsListRequest } from '#common/zod/backend/routes/projects/get-projects-list/get-projects-list-request';
import { zToBackendGetProjectsListResponse } from '#common/zod/backend/routes/projects/get-projects-list/get-projects-list-response';

export class ToBackendGetProjectsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectsListRequest })
) {}

export class ToBackendGetProjectsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectsListResponse })
) {}
