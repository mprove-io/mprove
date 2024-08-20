import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { RepsQuery } from '~front/app/queries/reps.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../../shared/shared.module';

enum RepSaveAsEnum {
  NEW_REP = 'NEW_REP',
  REPLACE_EXISTING_REP = 'REPLACE_EXISTING_REP'
}

export interface RepSaveAsDialogData {
  apiService: ApiService;
  reps: common.RepX[];
  rep: common.RepX;
}

@Component({
  selector: 'm-rep-save-as-dialog',
  templateUrl: './rep-save-as-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    TippyDirective
  ]
})
export class RepSaveAsDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  usersFolder = common.MPROVE_USERS_FOLDER;

  repSaveAsEnum = RepSaveAsEnum;

  spinnerName = 'repSaveAs';

  rep: common.RepX;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  usersForm: FormGroup = this.fb.group({
    users: [undefined, [Validators.maxLength(255)]]
  });

  saveAs: RepSaveAsEnum = RepSaveAsEnum.NEW_REP;

  newRepId: string;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  fromRepId: string;

  selectedRepId: any; // string
  selectedRepPath: string;

  reps: common.RepX[];

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<RepSaveAsDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private repQuery: RepQuery,
    private repsQuery: RepsQuery,
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.rep = this.ref.data.rep;

    this.fromRepId = this.ref.data.rep.repId;
    this.newRepId = this.ref.data.rep.repId;

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.rep.title
    });

    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.rep.accessRoles?.join(', ')
    });

    setValueAndMark({
      control: this.usersForm.controls['users'],
      value: this.rep.accessUsers?.join(', ')
    });

    this.reps = this.ref.data.reps.map(x => {
      (x as any).disabled = !x.canEditOrDeleteRep;
      return x;
    });

    this.makePath();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    if (
      this.titleForm.controls['title'].valid &&
      this.rolesForm.controls['roles'].valid &&
      this.usersForm.controls['users'].valid
    ) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let roles = this.rolesForm.controls['roles'].value;
      let users = this.usersForm.controls['users'].value;

      if (this.saveAs === RepSaveAsEnum.NEW_REP) {
        this.saveAsNewRep({
          newTitle: newTitle,
          roles: roles,
          users: users
        });
      } else if (this.saveAs === RepSaveAsEnum.REPLACE_EXISTING_REP) {
        this.saveAsExistingRep({
          newTitle: newTitle,
          roles: roles,
          users: users
        });
      }
    }
  }

  newRepOnClick() {
    this.saveAs = RepSaveAsEnum.NEW_REP;
  }

  existingRepOnClick() {
    this.saveAs = RepSaveAsEnum.REPLACE_EXISTING_REP;
  }

  saveAsNewRep(item: { newTitle: string; roles: string; users: string }) {
    let { newTitle, roles, users } = item;

    let uiState = this.uiQuery.getValue();

    let payload: apiToBackend.ToBackendSaveCreateRepRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      newRepId: this.newRepId,
      fromRepId: this.fromRepId,
      title: newTitle,
      accessRoles: common.isDefinedAndNotEmpty(roles?.trim())
        ? roles.split(',')
        : [],
      accessUsers: common.isDefinedAndNotEmpty(users?.trim())
        ? users.split(',')
        : [],
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(constants.APP_SPINNER_NAME);

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveCreateRep,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendSaveCreateRepResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let reps = this.repsQuery.getValue().reps;

            let draftRepIndex = reps.findIndex(
              x => x.repId === this.fromRepId && x.draft === true
            );

            let newReps = [
              ...reps.slice(0, draftRepIndex),
              ...reps.slice(draftRepIndex + 1)
            ];

            newReps.push(resp.payload.rep);

            let draftReps = newReps.filter(x => x.draft === true);
            let structReps = newReps.filter(x => x.draft === false);

            newReps = [
              ...draftReps,
              ...structReps.sort((a, b) => {
                let aTitle = a.title.toLowerCase() || a.repId.toLowerCase();
                let bTitle = b.title.toLowerCase() || a.repId.toLowerCase();

                return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
              })
            ];

            this.repsQuery.update({ reps: newReps });
            this.repQuery.update(resp.payload.rep);

            this.spinner.hide(constants.APP_SPINNER_NAME); // route params do not change

            this.navigateService.navigateToMetricsRep({
              repId: resp.payload.rep.repId,
              selectRowsNodeIds: uiState.repSelectedNodes.map(node => node.id)
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  saveAsExistingRep(item: { newTitle: string; roles: string; users: string }) {
    let { newTitle, roles, users } = item;

    let uiState = this.uiQuery.getValue();

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendSaveModifyRepRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      modRepId: this.selectedRepId,
      fromRepId: this.fromRepId,
      title: newTitle,
      accessRoles: common.isDefinedAndNotEmpty(roles?.trim())
        ? roles.split(',').map(x => x.trim())
        : [],
      accessUsers: common.isDefinedAndNotEmpty(users?.trim())
        ? users.split(',').map(x => x.trim())
        : [],
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveModifyRep,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendSaveModifyRepResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let reps = this.repsQuery.getValue().reps;

            let draftRepIndex = reps.findIndex(
              x => x.repId === this.fromRepId && x.draft === true
            );

            let newRepsA = [
              ...reps.slice(0, draftRepIndex),
              ...reps.slice(draftRepIndex + 1)
            ];

            let modRepIndex = newRepsA.findIndex(
              x => x.repId === this.selectedRepId && x.draft === false
            );

            let modRep = newRepsA[modRepIndex];
            let modRepWithTitle = Object.assign({}, modRep, {
              title: newTitle
            });

            let newRepsB = [
              ...newRepsA.slice(0, modRepIndex),
              modRepWithTitle,
              ...newRepsA.slice(modRepIndex + 1)
            ];

            let draftReps = newRepsB.filter(x => x.draft === true);
            let structReps = newRepsB.filter(x => x.draft === false);

            let newRepsC = [
              ...draftReps,
              ...structReps.sort((a, b) => {
                let aTitle = a.title.toLowerCase() || a.repId.toLowerCase();
                let bTitle = b.title.toLowerCase() || a.repId.toLowerCase();

                return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
              })
            ];

            this.repsQuery.update({ reps: newRepsC });

            this.navigateService.navigateToMetricsRep({
              repId: resp.payload.rep.repId,
              selectRowsNodeIds: uiState.repSelectedNodes.map(node => node.id)
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  selectedChange() {
    this.makePath();
    if (common.isDefined(this.selectedRepId)) {
      let selectedRep = this.reps.find(x => x.repId === this.selectedRepId);
      this.titleForm.controls['title'].setValue(selectedRep.title);
    }
  }

  makePath() {
    if (
      common.isUndefined(this.selectedRepId) ||
      common.isUndefined(this.reps)
    ) {
      return;
    }

    let selectedRep = this.reps.find(x => x.repId === this.selectedRepId);

    if (common.isDefined(selectedRep)) {
      let parts = selectedRep.filePath.split('/');

      parts.shift();

      this.selectedRepPath = parts.join(' / ');
    }
  }

  cancel() {
    this.ref.close();
  }
}
