import { VarsSubStep } from './vars-sub-step';

export interface ViewPart {
  viewName: string;
  deps: { [depPartName: string]: number };
  sub: string[];
  varsSubSteps: VarsSubStep[];
}
