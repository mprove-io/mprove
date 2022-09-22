import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take, tap } from 'rxjs/operators';
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

  envsList: common.EnvsItem[] = [];
  envsListLoading = false;
  envsListLength = 0;

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
    this.addConnectionForm = this.fb.group({
      connectionId: [
        undefined,
        [Validators.required, Validators.maxLength(255)]
      ],
      envId: [common.PROJECT_ENV_PROD],
      type: [common.ConnectionTypeEnum.SnowFlake],
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
      account: [
        undefined,
        [
          conditionalValidator(
            () =>
              [common.ConnectionTypeEnum.SnowFlake].indexOf(
                this.addConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      warehouse: [
        undefined,
        [
          conditionalValidator(
            () =>
              [common.ConnectionTypeEnum.SnowFlake].indexOf(
                this.addConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      host: [
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
      port: [
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
      database: [
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
      username: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse,
                common.ConnectionTypeEnum.SnowFlake
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      password: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse,
                common.ConnectionTypeEnum.SnowFlake
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
      this.addConnectionForm.get('account').updateValueAndValidity();
      this.addConnectionForm.get('warehouse').updateValueAndValidity();
      this.addConnectionForm.get('host').updateValueAndValidity();
      this.addConnectionForm.get('port').updateValueAndValidity();
      this.addConnectionForm.get('database').updateValueAndValidity();
      this.addConnectionForm.get('username').updateValueAndValidity();
      this.addConnectionForm.get('password').updateValueAndValidity();
    });
  }

  openEnvSelect() {
    this.envsListLoading = true;

    let payload: apiToBackend.ToBackendGetEnvsListRequestPayload = {
      projectId: this.ref.data.projectId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvsList,
        payload
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetEnvsListResponse) =>
            resp.payload.envsList
        ),
        tap(x => {
          this.envsList = x;
          this.envsListLoading = false;
          this.envsListLength = x.length;
        }),
        take(1)
      )
      .subscribe();
  }

  changeType(type: common.ConnectionTypeEnum) {
    if (type !== common.ConnectionTypeEnum.BigQuery) {
      this.addConnectionForm.controls['bigqueryCredentials'].reset();
      this.addConnectionForm.controls['bigqueryQuerySizeLimitGb'].reset();
    }

    if (type !== common.ConnectionTypeEnum.SnowFlake) {
      this.addConnectionForm.controls['account'].reset();
      this.addConnectionForm.controls['warehouse'].reset();
    }

    if (
      [
        common.ConnectionTypeEnum.SnowFlake,
        common.ConnectionTypeEnum.ClickHouse,
        common.ConnectionTypeEnum.PostgreSQL
      ].indexOf(type) < 0
    ) {
      this.addConnectionForm.controls['username'].reset();
      this.addConnectionForm.controls['password'].reset();
    }

    if (
      [
        common.ConnectionTypeEnum.PostgreSQL,
        common.ConnectionTypeEnum.ClickHouse
      ].indexOf(type) < 0
    ) {
      this.addConnectionForm.controls['host'].reset();
      this.addConnectionForm.controls['port'].reset();
      this.addConnectionForm.controls['database'].reset();
    }
  }

  toggleSSL($event: any) {
    this.isSSL = $event;
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
      envId: this.addConnectionForm.value.envId,
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
      account: this.addConnectionForm.value.account,
      warehouse: this.addConnectionForm.value.warehouse,
      host: this.addConnectionForm.value.host,
      port: common.isDefined(this.addConnectionForm.value.port)
        ? Number(this.addConnectionForm.value.port)
        : undefined,
      database: this.addConnectionForm.value.database,
      username: this.addConnectionForm.value.username,
      password: this.addConnectionForm.value.password,
      isSSL: this.isSSL
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateConnection,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateConnectionResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let connection = resp.payload.connection;

            this.connectionsStore.update(
              state =>
                <ConnectionsState>{
                  connections: [...state.connections, connection],
                  total: state.total
                }
            );
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
