import { VarsSubStep } from './vars-sub-step';

export interface ViewPart {
  sql: string[];
  viewName: string;
  deps: { [depName: string]: number };
  varsSubSteps: VarsSubStep[];
}
