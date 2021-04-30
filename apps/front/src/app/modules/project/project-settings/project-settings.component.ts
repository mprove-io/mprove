import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
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

  constructor(
    public projectQuery: ProjectQuery,
    public navQuery: NavQuery,
    // private apiService: ApiService,
    // private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}
}
