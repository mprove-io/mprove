import { IsEnum, IsString } from 'class-validator';
import { enums } from '~api-to-backend/barrels/enums';

export class OrgUsersItem {
  @IsString()
  avatarUrlSmall: string;

  @IsString()
  avatarUrlBig: string;

  @IsString()
  email: string;

  @IsString()
  alias: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(enums.UserStatusEnum)
  status: enums.UserStatusEnum;

  @IsString({ each: true })
  projectAdminProjects: string[];

  @IsString({ each: true })
  blockmlEditorProjects: string[];

  @IsString({ each: true })
  modelExplorerProjects: string[];

  @IsString({ each: true })
  projectUserProjects: string[];
}
