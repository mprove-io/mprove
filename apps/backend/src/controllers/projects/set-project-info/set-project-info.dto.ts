import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetProjectInfoRequest } from '#common/zod/backend/routes/projects/set-project-info/set-project-info-request';
import { zToBackendSetProjectInfoResponse } from '#common/zod/backend/routes/projects/set-project-info/set-project-info-response';

export class ToBackendSetProjectInfoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectInfoRequest })
) {}

export class ToBackendSetProjectInfoResponseDto extends createBackendResponseDto(
  { schema: zToBackendSetProjectInfoResponse }
) {}
