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
  selector: 'm-project-info',
  templateUrl: './project-info.component.html'
})
export class ProjectInfoComponent implements OnInit {
  pageTitle = constants.PROJECT_INFO_PAGE_TITLE;

  remoteTypeManaged = common.ProjectRemoteTypeEnum.Managed;
  remoteTypeGitClone = common.ProjectRemoteTypeEnum.GitClone;

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

  isGitUrlVisible = false;
  isPublicKeyVisible = false;

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

  toggleShowGitUrl() {
    this.isGitUrlVisible = !this.isGitUrlVisible;
  }

  toggleShowPublicKey() {
    this.isPublicKeyVisible = !this.isPublicKeyVisible;
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
