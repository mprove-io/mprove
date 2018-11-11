import * as api from 'src/app/api/_index';
import { ModelFieldExtra } from 'src/app/interfaces/model-field-extra';

export interface ModelNodeField extends api.ModelNode {
  field?: ModelFieldExtra;
}
