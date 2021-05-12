import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';
import { ConnectionsStore } from '~front/app/stores/connections.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-add-connection-dialog',
  templateUrl: './add-connection-dialog.component.html'
})
export class AddConnectionDialogComponent implements OnInit {
  addConnectionForm: FormGroup;

  connectionTypes = [
    common.ConnectionTypeEnum.PostgreSQL,
    common.ConnectionTypeEnum.BigQuery
  ];

  typePostgreSql = common.ConnectionTypeEnum.PostgreSQL;
  typeBigquery = common.ConnectionTypeEnum.BigQuery;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private connectionsStore: ConnectionsStore
  ) {}

  ngOnInit() {
    this.addConnectionForm = this.fb.group({
      connectionId: ['', [Validators.maxLength(255)]],
      type: [common.ConnectionTypeEnum.PostgreSQL],
      bigqueryCredentials: [],
      bigqueryQuerySizeLimitGb: [
        undefined,
        [ValidationService.integerValidator]
      ],
      postgresHost: [],
      postgresPort: [],
      postgresDatabase: [],
      postgresUser: [],
      postgresPassword: []
    });
  }

  changeType(ev: any) {
    if (ev !== common.ConnectionTypeEnum.BigQuery) {
      this.addConnectionForm.controls['bigqueryCredentials'].reset();
      this.addConnectionForm.controls['bigqueryQuerySizeLimitGb'].reset();
    }

    if (ev !== common.ConnectionTypeEnum.PostgreSQL) {
      this.addConnectionForm.controls['postgresHost'].reset();
      this.addConnectionForm.controls['postgresPort'].reset();
      this.addConnectionForm.controls['postgresDatabase'].reset();
      this.addConnectionForm.controls['postgresUser'].reset();
      this.addConnectionForm.controls['postgresPassword'].reset();
    }
  }

  add() {
    this.addConnectionForm.markAllAsTouched();

    if (!this.addConnectionForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateConnectionRequestPayload = {
      projectId: this.ref.data.projectId,
      connectionId: this.addConnectionForm.value.connectionId,
      type: this.addConnectionForm.value.type,
      bigqueryCredentials: common.isDefined(
        this.addConnectionForm.value.bigqueryCredentials
      )
        ? JSON.parse(this.addConnectionForm.value.bigqueryCredentials)
        : undefined,
      bigqueryQuerySizeLimitGb: common.isDefined(
        this.addConnectionForm.value.bigqueryQuerySizeLimitGb
      )
        ? Number(this.addConnectionForm.value.bigqueryQuerySizeLimitGb)
        : undefined,
      postgresHost: this.addConnectionForm.value.postgresHost,
      postgresPort: common.isDefined(this.addConnectionForm.value.postgresPort)
        ? Number(this.addConnectionForm.value.postgresPort)
        : undefined,
      postgresDatabase: this.addConnectionForm.value.postgresDatabase,
      postgresUser: this.addConnectionForm.value.postgresUser,
      postgresPassword: this.addConnectionForm.value.postgresPassword
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateConnection,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendCreateConnectionResponse) => {
          let connection = resp.payload.connection;

          this.connectionsStore.update(state => ({
            connections: [...state.connections, connection],
            total: state.total
          }));
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
