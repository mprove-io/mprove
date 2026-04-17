import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDownloadSkillsRequest,
  zToBackendDownloadSkillsResponse
} from '#common/zod/to-backend/skills/to-backend-download-skills';

export class ToBackendDownloadSkillsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDownloadSkillsRequest })
) {}

export class ToBackendDownloadSkillsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDownloadSkillsResponse })
) {}
