import { IsBoolean } from 'class-validator';
import { ModelPart } from './model-part';

export class ModelPartX extends ModelPart {
  @IsBoolean()
  hasAccess: boolean;
}
