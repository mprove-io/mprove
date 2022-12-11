import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { common } from '~front/barrels/common';
import { NavigateService } from '../services/navigate.service';

export function checkModel(item: {
  modelId: string;
  route: ActivatedRouteSnapshot;
  navigateService: NavigateService;
}) {
  let { route, navigateService, modelId } = item;

  let parametersModelId = route.params[common.PARAMETER_MODEL_ID];

  if (common.isDefined(parametersModelId) && modelId !== parametersModelId) {
    navigateService.navigateToModels();
    return of(false);
  }
}
