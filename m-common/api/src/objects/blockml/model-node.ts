import * as apiEnums from '../../enums/_index';

export class ModelNode {
  id: string;
  label: string;
  description?: string;
  nodeClass: apiEnums.ModelNodeNodeClassEnum;
  viewName?: string;
  isField: boolean;
  fieldFileName?: string;
  fieldLineNum?: number;
  hidden: boolean;
  children?: ModelNode[];
}
