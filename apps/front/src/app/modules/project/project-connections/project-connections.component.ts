import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { ConnectionsQuery } from '~front/app/queries/connections.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-connections',
  templateUrl: './project-connections.component.html'
})
export class ProjectConnectionsComponent implements OnInit {
  typeBigQuery = common.ConnectionTypeEnum.BigQuery;

  pageTitle = constants.PROJECT_CONNECTIONS_PAGE_TITLE;

  connectionTypeClickhouse = common.ConnectionTypeEnum.ClickHouse;

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
    private connectionsQuery: ConnectionsQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  getConnections(pageNum: number) {
    let payload: apiToBackend.ToBackendGetConnectionsRequestPayload = {
      projectId: this.projectId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetConnections,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetConnectionsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.connectionsQuery.update(resp.payload);
            this.currentPage = pageNum;
          }
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

  deleteConnection(connection: common.Connection) {
    this.myDialogService.showDeleteConnection({
      apiService: this.apiService,
      projectId: connection.projectId,
      envId: connection.envId,
      connectionId: connection.connectionId
    });
  }

  editConnection(connection: common.Connection, i: number) {
    this.myDialogService.showEditConnection({
      apiService: this.apiService,
      connection: connection,
      i: i
    });
  }
}
