import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetMemberGivensRequest } from '#common/zod/backend/routes/members/get-member-givens/get-member-givens-request';
import { zToBackendGetMemberGivensResponse } from '#common/zod/backend/routes/members/get-member-givens/get-member-givens-response';

export class ToBackendGetMemberGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMemberGivensRequest })
) {}

export class ToBackendGetMemberGivensResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMemberGivensResponse })
) {}
