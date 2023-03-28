import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { tap } from 'rxjs';
import { UiQuery } from '~front/app/queries/ui.query';
import { UiService } from '~front/app/services/ui.service';

@Component({
  selector: 'm-parameters-header',
  templateUrl: './parameters-header.component.html'
})
export class ParametersHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  showParametersJson = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showParametersJson = x.showParametersJson;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private uiService: UiService,
    private cd: ChangeDetectorRef
  ) {}

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }

  toggleShowParametersJson() {
    let showParametersJson = !this.showParametersJson;

    this.uiQuery.updatePart({ showParametersJson: showParametersJson });
    this.uiService.setUserUi({ showParametersJson: showParametersJson });
  }
}
