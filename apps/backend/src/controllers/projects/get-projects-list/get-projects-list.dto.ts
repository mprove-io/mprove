import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetProjectsListRequest,
  zToBackendGetProjectsListResponse
} from '#common/zod/to-backend/projects/to-backend-get-projects-list';

export class ToBackendGetProjectsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectsListRequest })
) {}

export class ToBackendGetProjectsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProjectsListResponse })
) {}
