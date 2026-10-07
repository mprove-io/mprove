import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetRepoRequest } from '#common/types/backend/routes/repos/get-repo/get-repo-request';
import { zToBackendGetRepoResponse } from '#common/types/backend/routes/repos/get-repo/get-repo-response';

export class ToBackendGetRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRepoRequest })
) {}

export class ToBackendGetRepoResponseDto extends createBackendResponseDto({
  schema: zToBackendGetRepoResponse
}) {}
