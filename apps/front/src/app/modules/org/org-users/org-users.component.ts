import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { makeInitials } from '~front/app/functions/make-initials';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { UsersQuery } from '~front/app/queries/users.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

class OrgUserItemExtended extends apiToBackend.OrgUsersItem {
  initials: string;
}

@Component({
  selector: 'm-org-users',
  templateUrl: './org-users.component.html'
})
export class OrgUsersComponent implements OnInit {
  pageTitle = constants.ORGANIZATION_USERS_PAGE_TITLE;

  currentPage: any = 1;
  perPage = constants.USERS_PER_PAGE;

  orgId: string;
  orgId$ = this.navQuery.orgId$.pipe(
    tap(x => {
      this.orgId = x;
      this.cd.detectChanges();
    })
  );

  users: OrgUserItemExtended[] = [];
  users$ = this.usersQuery.users$.pipe(
    tap(x => {
      this.users = x.map(user =>
        Object.assign(user, {
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
  total$ = this.usersQuery.total$.pipe(
    tap(x => {
      this.total = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private usersQuery: UsersQuery,
    private navQuery: NavQuery,
    private orgQuery: OrgQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  getUsers(pageNum: number) {
    let payload: apiToBackend.ToBackendGetOrgUsersRequestPayload = {
      orgId: this.orgId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetOrgUsersResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.usersQuery.update({
              users: resp.payload.orgUsersList,
              total: resp.payload.total
            });
            this.currentPage = pageNum;
          }
        })
      )
      .subscribe();
  }

  showPhoto(
    memberId: string,
    firstName: string,
    lastName: string,
    alias: string
  ) {
    let initials = makeInitials({
      firstName: firstName,
      lastName: lastName,
      alias: alias
    });

    let payload: apiToBackend.ToBackendGetAvatarBigRequestPayload = {
      avatarUserId: memberId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetAvatarBigResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.myDialogService.showPhoto({
              avatarBig: resp.payload.avatarBig,
              initials: initials
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
