import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { SERVER_USERS_PAGE_TITLE } from '#common/constants/page-titles';
import { USERS_PER_PAGE } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ServerUsersItem,
  ToBackendGetServerUsersRequestPayload,
  ToBackendGetServerUsersResponse
} from '#common/zod/to-backend/users/to-backend-get-server-users';
import { makeInitials } from '#front/app/functions/make-initials';
import { ServerUsersQuery } from '#front/app/queries/server-users.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

export type ServerUsersItemExtended = ServerUsersItem & { initials: string };

function formatCreatedTs(item: { ts: number }): string {
  let { ts } = item;
  let d = new Date(ts);
  let day = d.getDate();
  let month = d.toLocaleString('en-US', { month: 'short' });
  let year = d.getFullYear();
  let hh = d.getHours().toString().padStart(2, '0');
  let mm = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} ${hh}:${mm}`;
}

@Component({
  standalone: false,
  selector: 'm-server-users',
  templateUrl: './server-users.component.html'
})
export class ServerUsersComponent implements OnInit {
  pageTitle = SERVER_USERS_PAGE_TITLE;

  currentPage: any = 1;
  perPage = USERS_PER_PAGE;

  serverUsers: ServerUsersItemExtended[] = [];
  serverUsers$ = this.serverUsersQuery.serverUsers$.pipe(
    tap(x => {
      this.serverUsers = x.map(user =>
        Object.assign({}, user, {
          initials: makeInitials({
            firstName: user.firstName,
            lastName: user.lastName,
            alias: user.alias
          })
        })
      );
      this.cd.detectChanges();
    })
  );

  total: number;
  total$ = this.serverUsersQuery.total$.pipe(
    tap(x => {
      this.total = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private serverUsersQuery: ServerUsersQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  formatTs(item: { ts: number }): string {
    return formatCreatedTs(item);
  }

  getUsers(pageNum: number) {
    let payload: ToBackendGetServerUsersRequestPayload = {
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetServerUsers,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetServerUsersResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.serverUsersQuery.update({
              serverUsers: resp.payload.serverUsersList,
              total: resp.payload.total
            });
            this.currentPage = pageNum;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  showPhoto(item: {
    userId: string;
    firstName: string;
    lastName: string;
    alias: string;
    avatarSmall: string;
  }) {
    let { userId, firstName, lastName, alias, avatarSmall } = item;

    let initials = makeInitials({
      firstName: firstName,
      lastName: lastName,
      alias: alias
    });

    this.myDialogService.showPhoto({
      avatar: avatarSmall,
      initials: initials
    });
  }
}
