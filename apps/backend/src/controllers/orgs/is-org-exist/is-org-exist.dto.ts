import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendIsOrgExistRequest } from '#common/types/backend/routes/orgs/is-org-exist/is-org-exist-request';
import { zToBackendIsOrgExistResponse } from '#common/types/backend/routes/orgs/is-org-exist/is-org-exist-response';

export class ToBackendIsOrgExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsOrgExistRequest })
) {}

export class ToBackendIsOrgExistResponseDto extends createBackendResponseDto({
  schema: zToBackendIsOrgExistResponse
}) {}
