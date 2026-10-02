import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { PROJECT_GIVENS_PAGE_TITLE } from '#common/constants/page-titles';
import type { Given } from '#common/types/backend/given';
import { GivensQuery } from '#front/app/queries/givens.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-project-givens',
  templateUrl: './project-givens.component.html'
})
export class ProjectGivensComponent implements OnInit {
  pageTitle = PROJECT_GIVENS_PAGE_TITLE;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
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

  givens: Given[] = [];
  givens$ = this.givensQuery.givens$.pipe(
    tap(x => {
      this.givens = x.sort((a, b) =>
        a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
      );
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private givensQuery: GivensQuery,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  addGiven() {
    this.myDialogService.showAddGiven({
      apiService: this.apiService,
      projectId: this.nav.projectId
    });
  }

  editGiven(given: Given) {
    this.myDialogService.showEditGiven({
      apiService: this.apiService,
      given: given
    });
  }

  deleteGiven(given: Given) {
    this.myDialogService.showDeleteGiven({
      apiService: this.apiService,
      given: given
    });
  }
}
