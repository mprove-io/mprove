import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { isDefined } from '#common/functions/is-defined/is-defined';

export type CanComponentDeactivate = {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
};

@Injectable({ providedIn: 'root' })
export class DeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate) {
    return isDefined(component?.canDeactivate)
      ? component.canDeactivate()
      : true;
  }
}
