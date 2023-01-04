import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-settings',
  templateUrl: './project-settings.component.html'
})
export class ProjectSettingsComponent implements OnInit {
  pageTitle = constants.PROJECT_SETTINGS_PAGE_TITLE;

  project: common.Project;
  project$ = this.projectQuery.select().pipe(
    tap(x => {
      this.project = x;
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

  constructor(
    private projectQuery: ProjectQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  deleteProject() {
    this.myDialogService.showDeleteProject({
      apiService: this.apiService,
      projectId: this.project.projectId,
      projectName: this.project.name
    });
  }

  editName() {
    this.myDialogService.showEditProjectName({
      apiService: this.apiService,
      projectId: this.project.projectId,
      projectName: this.project.name
    });
  }
}
