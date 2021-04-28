import { Component, OnInit } from '@angular/core';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-org-deleted',
  templateUrl: './org-deleted.component.html'
})
export class OrgDeletedComponent implements OnInit {
  orgName: string;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.orgName = localStorage.getItem(constants.LOCAL_STORAGE_ORG_NAME);
    localStorage.removeItem(constants.LOCAL_STORAGE_ORG_NAME);

    if (common.isUndefined(this.orgName)) {
      this.authService.logout();
    }
  }
}
