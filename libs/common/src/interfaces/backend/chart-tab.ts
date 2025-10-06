export class ChartTab {
  @IsString()
  title: string;

  @IsString()
  modelLabel: string;

  @IsString()
  filePath: string;

  @IsString({ each: true })
  accessRoles: string[];
}
