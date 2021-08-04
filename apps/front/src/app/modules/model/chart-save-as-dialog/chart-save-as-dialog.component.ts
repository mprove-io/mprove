import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { prepareReport } from '~front/app/functions/prepare-report';
import { toYaml } from '~front/app/functions/to-yaml';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

enum ChartSaveAsEnum {
  NEW_VIZ = 'NEW_VIZ',
  MODIFY_EXISTING_VIZ = 'MODIFY_EXISTING_VIZ',
  NEW_REPORT_OF_NEW_DASHBOARD = 'NEW_REPORT_OF_NEW_DASHBOARD',
  NEW_REPORT_OF_EXISTING_DASHBOARD = 'NEW_REPORT_OF_EXISTING_DASHBOARD',
  MODIFY_REPORT_OF_EXISTING_DASHBOARD = 'MODIFY_REPORT_OF_EXISTING_DASHBOARD'
}

@Component({
  selector: 'm-chart-save-as-dialog',
  templateUrl: './chart-save-as-dialog.component.html'
})
export class ChartSaveAsDialogComponent implements OnInit {
  // createBranchForm: FormGroup;

  // branchesList: interfaces.BranchItem[] = this.ref.data.branchesList;

  // selectedBranchItem: interfaces.BranchItem = this.ref.data.selectedBranchItem;
  // selectedBranchExtraId: string = this.ref.data.selectedBranchExtraId;

  saveAs: ChartSaveAsEnum = ChartSaveAsEnum.NEW_VIZ;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private router: Router,
    private userQuery: UserQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let branchId: string;

    // this.createBranchForm = this.fb.group({
    //   branchId: [branchId, [Validators.maxLength(255)]],
    //   fromBranch: [this.selectedBranchExtraId]
    // });
  }

  save() {
    // this.createBranchForm.markAllAsTouched();

    // if (!this.createBranchForm.valid) {
    //   return;
    // }

    if (this.saveAs === ChartSaveAsEnum.NEW_VIZ) {
      this.saveAsNewViz();
    }

    this.ref.close();
  }

  saveAsNewViz() {
    let vizId = common.makeId();

    let rep = prepareReport(this.ref.data.mconfig);

    let vizFileText = toYaml({
      viz: vizId,
      reports: [rep]
    });

    let payload: apiToBackend.ToBackendCreateVizRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      vizId: vizId,
      vizFileText: vizFileText
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateVizResponse) => {}),
        take(1)
      )
      .subscribe();
  }

  // branchChange(branchItem: interfaces.BranchItem) {
  //   this.selectedBranchItem = this.branchesList.find(
  //     x => x.extraId === branchItem.extraId
  //   );

  //   this.cd.detectChanges();
  // }

  cancel() {
    this.ref.close();
  }
}
