import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  defer,
  finalize,
  type MonoTypeOperatorFunction,
  type Observable
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocalSpinnerService {
  private operationCountByName: Map<string, number> = new Map<string, number>();

  constructor(private spinner: NgxSpinnerService) {}

  /** Shared names remain visible until their last active subscription finishes. */
  track<T>(item: { name: string }): MonoTypeOperatorFunction<T> {
    let { name } = item;

    let operator: MonoTypeOperatorFunction<T> = source =>
      defer(() => {
        let operationCount: number = this.operationCountByName.get(name) ?? 0;

        this.operationCountByName.set(name, operationCount + 1);

        if (operationCount === 0) {
          void this.spinner.show(name);
        }

        let response: Observable<T> = source.pipe(
          finalize(() => {
            let remainingCount: number =
              this.operationCountByName.get(name) - 1;

            if (remainingCount === 0) {
              this.operationCountByName.delete(name);

              void this.spinner.hide(name);
            } else {
              this.operationCountByName.set(name, remainingCount);
            }
          })
        );

        return response;
      });

    return operator;
  }
}
