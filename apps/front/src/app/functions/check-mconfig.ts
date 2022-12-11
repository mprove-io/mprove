import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { common } from '~front/barrels/common';
import { NavigateService } from '../services/navigate.service';

export function checkMconfig(item: {
  mconfigId: string;
  modelId: string;
  route: ActivatedRouteSnapshot;
  navigateService: NavigateService;
}) {
  let { route, navigateService, modelId, mconfigId } = item;

  let parametersMconfigId = route.params[common.PARAMETER_MCONFIG_ID];

  if (
    common.isDefined(parametersMconfigId) &&
    mconfigId !== parametersMconfigId
  ) {
    navigateService.navigateToModel(modelId);
    return of(false);
  }
}
