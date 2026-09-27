import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendIsOrgExistRequest } from '#common/zod/backend/routes/orgs/is-org-exist/is-org-exist-request';
import { zToBackendIsOrgExistResponse } from '#common/zod/backend/routes/orgs/is-org-exist/is-org-exist-response';

export class ToBackendIsOrgExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsOrgExistRequest })
) {}

export class ToBackendIsOrgExistResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsOrgExistResponse })
) {}
