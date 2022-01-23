import { IsBoolean } from 'class-validator';
import { Model } from '../blockml/model';

export class ModelX extends Model {
  @IsBoolean()
  hasAccess: boolean;
}
