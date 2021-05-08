import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-project-settings',
  templateUrl: './project-settings.component.html'
})
export class ProjectSettingsComponent {
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
    public projectQuery: ProjectQuery,
    public memberQuery: MemberQuery,
    public navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}

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
