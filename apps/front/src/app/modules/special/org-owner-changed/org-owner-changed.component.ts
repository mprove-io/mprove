import { Component, OnInit } from '@angular/core';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-org-owner-changed',
  templateUrl: './org-owner-changed.component.html'
})
export class OrgOwnerChangedComponent implements OnInit {
  orgName: string;
  newOrgOwner: string;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.orgName = localStorage.getItem(
      constants.LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME
    );
    localStorage.removeItem(constants.LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME);

    this.newOrgOwner = localStorage.getItem(
      constants.LOCAL_STORAGE_NEW_ORG_OWNER
    );
    localStorage.removeItem(constants.LOCAL_STORAGE_NEW_ORG_OWNER);

    if (
      common.isUndefined(this.orgName) ||
      common.isUndefined(this.newOrgOwner)
    ) {
      this.authService.logout();
    }
  }
}
