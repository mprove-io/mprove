import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { ORGANIZATION_USERS_PAGE_TITLE } from '~common/constants/page-titles';
import { USERS_PER_PAGE } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  OrgUsersItem,
  ToBackendGetOrgUsersRequestPayload,
  ToBackendGetOrgUsersResponse
} from '~common/interfaces/to-backend/org-users/to-backend-get-org-users';
import { makeInitials } from '~front/app/functions/make-initials';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { UsersQuery } from '~front/app/queries/users.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

class OrgUserItemExtended extends OrgUsersItem {
  initials: string;
}

@Component({
  standalone: false,
  selector: 'm-org-users',
  templateUrl: './org-users.component.html'
})
export class OrgUsersComponent implements OnInit {
  pageTitle = ORGANIZATION_USERS_PAGE_TITLE;

  currentPage: any = 1;
  perPage = USERS_PER_PAGE;

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
    let payload: ToBackendGetOrgUsersRequestPayload = {
      orgId: this.orgId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetOrgUsersResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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

    // let payload: ToBackendGetAvatarBigRequestPayload = {
    //   avatarUserId: userId
    // };

    // this.apiService
    //   .req({
    //     pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig,
    //     payload: payload,
    //     showSpinner: true
    //   })
    //   .pipe(
    //     tap((resp: ToBackendGetAvatarBigResponse) => {
    //       if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
    //         this.myDialogService.showPhoto({
    //           avatar: resp.payload.avatarBig,
    //           initials: initials
    //         });
    //       }
    //     }),
    //     take(1)
    //   )
    //   .subscribe();
  }
}
