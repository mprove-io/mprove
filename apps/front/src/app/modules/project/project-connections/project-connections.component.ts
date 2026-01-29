import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { PROJECT_CONNECTIONS_PAGE_TITLE } from '#common/constants/page-titles';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ProjectConnection } from '#common/interfaces/backend/project-connection';
import { ConnectionsQuery } from '#front/app/queries/connections.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-project-connections',
  templateUrl: './project-connections.component.html'
})
export class ProjectConnectionsComponent implements OnInit {
  typeSnowFlake = ConnectionTypeEnum.SnowFlake;
  typeBigQuery = ConnectionTypeEnum.BigQuery;
  // typeClickHouse = ConnectionTypeEnum.ClickHouse;
  typeMotherDuck = ConnectionTypeEnum.MotherDuck;
  typePostgreSQL = ConnectionTypeEnum.PostgreSQL;
  typeMySQL = ConnectionTypeEnum.MySQL;
  typeTrino = ConnectionTypeEnum.Trino;
  typePresto = ConnectionTypeEnum.Presto;
  typeGoogleApi = ConnectionTypeEnum.GoogleApi;
  typeApi = ConnectionTypeEnum.Api;

  pageTitle = PROJECT_CONNECTIONS_PAGE_TITLE;

  // connectionTypeClickhouse = ConnectionTypeEnum.ClickHouse;

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

  connections: ProjectConnection[] = [];
  connections$ = this.connectionsQuery.connections$.pipe(
    tap(x => {
      this.connections = x;
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

  addConnection() {
    this.myDialogService.showAddConnection({
      apiService: this.apiService,
      projectId: this.projectId
    });
  }

  deleteConnection(connection: ProjectConnection) {
    this.myDialogService.showDeleteConnection({
      apiService: this.apiService,
      projectId: connection.projectId,
      envId: connection.envId,
      connectionId: connection.connectionId
    });
  }

  editConnection(connection: ProjectConnection) {
    this.myDialogService.showEditConnection({
      apiService: this.apiService,
      connection: connection
    });
  }
}
