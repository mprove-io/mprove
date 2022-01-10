import { IsBoolean } from 'class-validator';
import { Model } from '../blockml/model';

export class ModelsItem extends Model {
  @IsBoolean()
  hasAccess: boolean;
}
