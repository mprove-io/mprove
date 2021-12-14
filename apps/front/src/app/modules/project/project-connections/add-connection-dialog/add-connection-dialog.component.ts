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
  selector: 'm-add-connection-dialog',
  templateUrl: './add-connection-dialog.component.html'
})
export class AddConnectionDialogComponent implements OnInit {
  addConnectionForm: FormGroup;

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
    this.addConnectionForm = this.fb.group({
      connectionId: [
        undefined,
        [Validators.required, Validators.maxLength(255)]
      ],
      type: [common.ConnectionTypeEnum.PostgreSQL],
      bigqueryCredentials: [
        undefined,
        [
          conditionalValidator(
            () =>
              this.addConnectionForm.get('type').value ===
              common.ConnectionTypeEnum.BigQuery,
            Validators.required
          )
        ]
      ],
      bigqueryQuerySizeLimitGb: [
        1,
        [
          ValidationService.integerOrEmptyValidator,
          conditionalValidator(
            () =>
              this.addConnectionForm.get('type').value ===
              common.ConnectionTypeEnum.BigQuery,
            Validators.required
          )
        ]
      ],
      postgresHost: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      postgresPort: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      postgresDatabase: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL
                // ,
                // common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      postgresUser: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      postgresPassword: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ]
    });

    this.addConnectionForm.get('type').valueChanges.subscribe(value => {
      this.addConnectionForm
        .get('bigqueryCredentials')
        .updateValueAndValidity();
      this.addConnectionForm
        .get('bigqueryQuerySizeLimitGb')
        .updateValueAndValidity();
      this.addConnectionForm.get('postgresHost').updateValueAndValidity();
      this.addConnectionForm.get('postgresPort').updateValueAndValidity();
      this.addConnectionForm.get('postgresDatabase').updateValueAndValidity();
      this.addConnectionForm.get('postgresUser').updateValueAndValidity();
      this.addConnectionForm.get('postgresPassword').updateValueAndValidity();
    });
  }

  changeType(type: common.ConnectionTypeEnum) {
    if (type !== common.ConnectionTypeEnum.BigQuery) {
      this.addConnectionForm.controls['bigqueryCredentials'].reset();
      this.addConnectionForm.controls['bigqueryQuerySizeLimitGb'].reset();
    }

    if (
      [
        common.ConnectionTypeEnum.PostgreSQL,
        common.ConnectionTypeEnum.ClickHouse
      ].indexOf(type) < 0
    ) {
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

          this.connectionsStore.update(
            state =>
              <ConnectionsState>{
                connections: [...state.connections, connection],
                total: state.total
              }
          );
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
