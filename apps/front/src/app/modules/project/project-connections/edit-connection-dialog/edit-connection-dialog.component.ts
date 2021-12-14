import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { conditionalValidator } from '~front/app/functions/conditional-validator';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';
import {
  ConnectionsState,
  ConnectionsStore
} from '~front/app/stores/connections.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-edit-connection-dialog',
  templateUrl: './edit-connection-dialog.component.html'
})
export class EditConnectionDialogComponent implements OnInit {
  editConnectionForm: FormGroup;

  connectionTypes = [
    common.ConnectionTypeEnum.PostgreSQL,
    common.ConnectionTypeEnum.BigQuery,
    common.ConnectionTypeEnum.ClickHouse
  ];

  typePostgreSQL = common.ConnectionTypeEnum.PostgreSQL;
  typeBigQuery = common.ConnectionTypeEnum.BigQuery;
  typeClickHouse = common.ConnectionTypeEnum.ClickHouse;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private connectionsStore: ConnectionsStore
  ) {}

  ngOnInit() {
    this.editConnectionForm = this.fb.group({
      connectionId: [this.ref.data.connection.connectionId],
      type: [this.ref.data.connection.type],
      bigqueryCredentials: [
        undefined,
        [
          conditionalValidator(
            () =>
              this.editConnectionForm.get('type').value ===
              common.ConnectionTypeEnum.BigQuery,
            Validators.required
          )
        ]
      ],
      bigqueryQuerySizeLimitGb: [
        this.ref.data.connection.bigqueryQuerySizeLimitGb,
        [
          ValidationService.integerOrEmptyValidator,
          conditionalValidator(
            () =>
              this.editConnectionForm.get('type').value ===
              common.ConnectionTypeEnum.BigQuery,
            Validators.required
          )
        ]
      ],
      postgresHost: [
        this.ref.data.connection.postgresHost,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      postgresPort: [
        this.ref.data.connection.postgresPort,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      postgresDatabase: [
        this.ref.data.connection.postgresDatabase,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL
                // ,
                // common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      postgresUser: [
        this.ref.data.connection.postgresUser,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      postgresPassword: [
        this.ref.data.connection.postgresPassword,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ]
    });

    this.editConnectionForm.get('type').valueChanges.subscribe(value => {
      this.editConnectionForm
        .get('bigqueryCredentials')
        .updateValueAndValidity();
      this.editConnectionForm
        .get('bigqueryQuerySizeLimitGb')
        .updateValueAndValidity();
      this.editConnectionForm.get('postgresHost').updateValueAndValidity();
      this.editConnectionForm.get('postgresPort').updateValueAndValidity();
      this.editConnectionForm.get('postgresDatabase').updateValueAndValidity();
      this.editConnectionForm.get('postgresUser').updateValueAndValidity();
      this.editConnectionForm.get('postgresPassword').updateValueAndValidity();
    });
  }

  changeType(ev: any) {
    if (ev !== common.ConnectionTypeEnum.BigQuery) {
      this.editConnectionForm.controls['bigqueryCredentials'].reset();
      this.editConnectionForm.controls['bigqueryQuerySizeLimitGb'].reset();
    }

    if (
      [
        common.ConnectionTypeEnum.PostgreSQL,
        common.ConnectionTypeEnum.ClickHouse
      ].indexOf(ev) < 0
    ) {
      this.editConnectionForm.controls['postgresHost'].reset();
      this.editConnectionForm.controls['postgresPort'].reset();
      this.editConnectionForm.controls['postgresDatabase'].reset();
      this.editConnectionForm.controls['postgresUser'].reset();
      this.editConnectionForm.controls['postgresPassword'].reset();
    }
  }

  save() {
    this.editConnectionForm.markAllAsTouched();

    if (!this.editConnectionForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendEditConnectionRequestPayload = {
      projectId: this.ref.data.connection.projectId,
      connectionId: this.editConnectionForm.value.connectionId,
      bigqueryCredentials: common.isDefined(
        this.editConnectionForm.value.bigqueryCredentials
      )
        ? JSON.parse(this.editConnectionForm.value.bigqueryCredentials)
        : undefined,
      bigqueryQuerySizeLimitGb: common.isDefined(
        this.editConnectionForm.value.bigqueryQuerySizeLimitGb
      )
        ? Number(this.editConnectionForm.value.bigqueryQuerySizeLimitGb)
        : undefined,
      postgresHost: this.editConnectionForm.value.postgresHost,
      postgresPort: common.isDefined(this.editConnectionForm.value.postgresPort)
        ? Number(this.editConnectionForm.value.postgresPort)
        : undefined,
      postgresDatabase: this.editConnectionForm.value.postgresDatabase,
      postgresUser: this.editConnectionForm.value.postgresUser,
      postgresPassword: this.editConnectionForm.value.postgresPassword
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditConnection,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendEditConnectionResponse) => {
          this.connectionsStore.update(state => {
            state.connections[this.ref.data.i] = resp.payload.connection;

            return <ConnectionsState>{
              connections: [...state.connections],
              total: state.total
            };
          });
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
