import * as api from '@app/api/_index';
import { ModelFieldExtra } from '@app/interfaces/model-field-extra';

export interface ModelNodeField extends api.ModelNode {
  field?: ModelFieldExtra;
}
