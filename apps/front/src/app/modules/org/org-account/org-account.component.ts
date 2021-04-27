import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  selector: 'm-org-account',
  templateUrl: './org-account.component.html'
})
export class OrgAccountComponent {
  constructor(
    public userQuery: UserQuery,
    public navQuery: NavQuery,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private myDialogService: MyDialogService
  ) {}
}
