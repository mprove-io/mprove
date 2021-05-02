import { Component, OnInit } from '@angular/core';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-deleted',
  templateUrl: './project-deleted.component.html'
})
export class ProjectDeletedComponent implements OnInit {
  projectName: string;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.projectName = localStorage.getItem(
      constants.LOCAL_STORAGE_DELETED_PROJECT_NAME
    );
    localStorage.removeItem(constants.LOCAL_STORAGE_DELETED_PROJECT_NAME);

    if (common.isUndefined(this.projectName)) {
      this.authService.logout();
    }
  }
}
