import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { tap } from 'rxjs';
import { RESTRICTED_USER_ALIAS } from '#common/constants/top';
import { MemberQuery } from '~front/app/queries/member.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-row-id-header',
  templateUrl: './row-id-header.component.html'
})
export class RowIdHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  restrictedUserAlias = RESTRICTED_USER_ALIAS;

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private myDialogService: MyDialogService,
    private memberQuery: MemberQuery,
    private userQuery: UserQuery,
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
