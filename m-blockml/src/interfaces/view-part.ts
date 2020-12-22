import { VarsSubElement } from './vars-sub-element';

export interface ViewPart {
  sql: string[];
  viewName: string;
  deps: { [depName: string]: number };
  varsSubElements: VarsSubElement[];
}
