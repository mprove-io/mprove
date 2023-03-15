import { VarsSubStep } from './vars-sub-step';

export interface FileViewPart {
  viewName: string;
  deps: { [depPartName: string]: number };
  sub: string[];
  varsSubSteps: VarsSubStep[];
}
