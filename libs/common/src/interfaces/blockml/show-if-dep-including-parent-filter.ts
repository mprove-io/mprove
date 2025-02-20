import { IsString } from 'class-validator';

export class ShowIfDepIncludingParentFilter {
  @IsString()
  filterName: string;

  @IsString()
  controlName: string;

  value: any;
}
