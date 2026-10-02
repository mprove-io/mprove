import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetProjectsListRequest } from '#common/types/backend/routes/projects/get-projects-list/get-projects-list-request';
import { zToBackendGetProjectsListResponse } from '#common/types/backend/routes/projects/get-projects-list/get-projects-list-response';

export class ToBackendGetProjectsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectsListRequest })
) {}

export class ToBackendGetProjectsListResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetProjectsListResponse }
) {}
