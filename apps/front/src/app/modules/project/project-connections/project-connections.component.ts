import { ChangeDetectorRef, Component } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { ConnectionsQuery } from '~front/app/queries/connections.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { ConnectionsStore } from '~front/app/stores/connections.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-connections',
  templateUrl: './project-connections.component.html'
})
export class ProjectConnectionsComponent {
  currentPage: any = 1;
  perPage = constants.CONNECTIONS_PER_PAGE;

  projectId: string;
  projectId$ = this.navQuery.projectId$.pipe(
    tap(x => {
      this.projectId = x;
      this.cd.detectChanges();
    })
  );

  isAdmin: boolean;
  isAdmin$ = this.memberQuery.isAdmin$.pipe(
    tap(x => {
      this.isAdmin = x;
      this.cd.detectChanges();
    })
  );

  connections: common.Connection[] = [];
  connections$ = this.connectionsQuery.connections$.pipe(
    tap(x => {
      this.connections = x;
      this.cd.detectChanges();
    })
  );

  total: number;
  total$ = this.connectionsQuery.total$.pipe(
    tap(x => {
      this.total = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public connectionsQuery: ConnectionsQuery,
    public connectionsStore: ConnectionsStore,
    public memberQuery: MemberQuery,
    public navQuery: NavQuery,
    public userQuery: UserQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}

  getConnections(pageNum: number) {
    let payload: apiToBackend.ToBackendGetConnectionsRequestPayload = {
      projectId: this.projectId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetConnections,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetConnectionsResponse) => {
          this.connectionsStore.update(resp.payload);
          this.currentPage = pageNum;
        }),
        take(1)
      )
      .subscribe();
  }

  addConnection() {
    this.myDialogService.showAddConnection({
      apiService: this.apiService,
      projectId: this.projectId
    });
  }
}
