import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
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

  isSSL = true;

  connectionTypes = [
    common.ConnectionTypeEnum.SnowFlake,
    common.ConnectionTypeEnum.BigQuery,
    common.ConnectionTypeEnum.ClickHouse,
    common.ConnectionTypeEnum.PostgreSQL
  ];

  typeSnowFlake = common.ConnectionTypeEnum.SnowFlake;
  typeBigQuery = common.ConnectionTypeEnum.BigQuery;
  typeClickHouse = common.ConnectionTypeEnum.ClickHouse;
  typePostgreSQL = common.ConnectionTypeEnum.PostgreSQL;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private connectionsStore: ConnectionsStore
  ) {}

  ngOnInit() {
    this.isSSL = this.ref.data.connection.isSSL === true ? true : false;

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
      account: [
        this.ref.data.connection.account,
        [
          conditionalValidator(
            () =>
              [common.ConnectionTypeEnum.SnowFlake].indexOf(
                this.editConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      warehouse: [
        this.ref.data.connection.warehouse,
        [
          conditionalValidator(
            () =>
              [common.ConnectionTypeEnum.SnowFlake].indexOf(
                this.editConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      host: [
        this.ref.data.connection.host,
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
      port: [
        this.ref.data.connection.port,
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
      database: [
        this.ref.data.connection.database,
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
      username: [
        this.ref.data.connection.username,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse,
                common.ConnectionTypeEnum.SnowFlake
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      password: [
        this.ref.data.connection.password,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse,
                common.ConnectionTypeEnum.SnowFlake
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
      this.editConnectionForm.get('account').updateValueAndValidity();
      this.editConnectionForm.get('warehouse').updateValueAndValidity();
      this.editConnectionForm.get('host').updateValueAndValidity();
      this.editConnectionForm.get('port').updateValueAndValidity();
      this.editConnectionForm.get('database').updateValueAndValidity();
      this.editConnectionForm.get('username').updateValueAndValidity();
      this.editConnectionForm.get('password').updateValueAndValidity();
    });
  }

  changeType(ev: any) {
    if (ev !== common.ConnectionTypeEnum.BigQuery) {
      this.editConnectionForm.controls['bigqueryCredentials'].reset();
      this.editConnectionForm.controls['bigqueryQuerySizeLimitGb'].reset();
    }

    if (ev !== common.ConnectionTypeEnum.SnowFlake) {
      this.editConnectionForm.controls['account'].reset();
      this.editConnectionForm.controls['warehouse'].reset();
    }

    if (
      [
        common.ConnectionTypeEnum.SnowFlake,
        common.ConnectionTypeEnum.ClickHouse,
        common.ConnectionTypeEnum.PostgreSQL
      ].indexOf(ev) < 0
    ) {
      this.editConnectionForm.controls['username'].reset();
      this.editConnectionForm.controls['password'].reset();
    }

    if (
      [
        common.ConnectionTypeEnum.ClickHouse,
        common.ConnectionTypeEnum.PostgreSQL
      ].indexOf(ev) < 0
    ) {
      this.editConnectionForm.controls['host'].reset();
      this.editConnectionForm.controls['port'].reset();
      this.editConnectionForm.controls['database'].reset();
    }
  }

  toggleSSL($event: any) {
    this.isSSL = $event;
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
      account: this.editConnectionForm.value.account,
      warehouse: this.editConnectionForm.value.warehouse,
      host: this.editConnectionForm.value.host,
      port: common.isDefined(this.editConnectionForm.value.port)
        ? Number(this.editConnectionForm.value.port)
        : undefined,
      database: this.editConnectionForm.value.database,
      username: this.editConnectionForm.value.username,
      password: this.editConnectionForm.value.password,
      isSSL: this.isSSL
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditConnection,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendEditConnectionResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.connectionsStore.update(state => {
              state.connections[this.ref.data.i] = resp.payload.connection;

              return <ConnectionsState>{
                connections: [...state.connections],
                total: state.total
              };
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
