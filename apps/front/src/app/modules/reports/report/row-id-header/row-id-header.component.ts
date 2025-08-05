import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-row-id-header',
  templateUrl: './row-id-header.component.html'
})
export class RowIdHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  constructor(
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }

  addRow() {
    this.myDialogService.showReportAddRow({
      apiService: this.apiService
    });
  }
}
