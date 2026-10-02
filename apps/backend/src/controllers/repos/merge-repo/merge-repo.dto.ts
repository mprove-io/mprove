import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendMergeRepoRequest } from '#common/types/backend/routes/repos/merge-repo/merge-repo-request';
import { zToBackendMergeRepoResponse } from '#common/types/backend/routes/repos/merge-repo/merge-repo-response';

export class ToBackendMergeRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMergeRepoRequest })
) {}

export class ToBackendMergeRepoResponseDto extends createBackendResponseDto({
  schema: zToBackendMergeRepoResponse
}) {}
