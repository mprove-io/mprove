import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { UiSwitchModule } from 'ngx-ui-switch';
import { map, take, tap } from 'rxjs/operators';
import { conditionalValidator } from '~front/app/functions/conditional-validator';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { ConnectionsQuery } from '~front/app/queries/connections.query';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddConnectionDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-connection-dialog',
  templateUrl: './add-connection-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    UiSwitchModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule
  ]
})
export class AddConnectionDialogComponent implements OnInit {
  @ViewChild('addConnectionDialogEnvSelect', { static: false })
  addConnectionDialogEnvSelectElement: NgSelectComponent;

  @ViewChild('addConnectionDialogTypeSelect', { static: false })
  addConnectionDialogTypeSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.addConnectionDialogEnvSelectElement?.close();
    this.addConnectionDialogTypeSelectElement?.close();
    // this.ref.close();
  }

  addConnectionForm: FormGroup;

  envsList: common.EnvsItem[] = [];
  envsListLoading = false;
  envsListLength = 0;

  isSSL = true;

  headers: common.ConnectionHeader[] = [];

  connectionTypes = [
    common.ConnectionTypeEnum.PostgreSQL,
    common.ConnectionTypeEnum.SnowFlake,
    common.ConnectionTypeEnum.ClickHouse,
    common.ConnectionTypeEnum.BigQuery,
    common.ConnectionTypeEnum.GoogleApi,
    common.ConnectionTypeEnum.Api
  ];

  typePostgreSQL = common.ConnectionTypeEnum.PostgreSQL;
  typeSnowFlake = common.ConnectionTypeEnum.SnowFlake;
  typeClickHouse = common.ConnectionTypeEnum.ClickHouse;
  typeBigQuery = common.ConnectionTypeEnum.BigQuery;
  typeGoogleApi = common.ConnectionTypeEnum.GoogleApi;
  typeApi = common.ConnectionTypeEnum.Api;

  constructor(
    public ref: DialogRef<AddConnectionDialogData>,
    private fb: FormBuilder,
    private connectionsQuery: ConnectionsQuery
  ) {}

  ngOnInit() {
    this.addConnectionForm = this.fb.group({
      connectionId: [
        undefined,
        [Validators.required, Validators.maxLength(255)]
      ],
      envId: [common.PROJECT_ENV_PROD],
      type: [common.ConnectionTypeEnum.SnowFlake],
      baseUrl: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.GoogleApi,
                common.ConnectionTypeEnum.Api
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      serviceAccountCredentials: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.BigQuery,
                common.ConnectionTypeEnum.GoogleApi
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
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
              [common.ConnectionTypeEnum.BigQuery].indexOf(
                this.addConnectionForm.get('type').value
              ) > -1,

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
      this.addConnectionForm.get('baseUrl');
      this.addConnectionForm
        .get('serviceAccountCredentials')
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

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  openEnvSelect() {
    this.envsListLoading = true;

    let payload: apiToBackend.ToBackendGetEnvsListRequestPayload = {
      projectId: this.ref.data.projectId,
      isFilter: false
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvsList,
        payload: payload
      })
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
    if (
      [
        common.ConnectionTypeEnum.GoogleApi,
        common.ConnectionTypeEnum.Api
      ].indexOf(type) < 0
    ) {
      this.addConnectionForm.controls['baseUrl'].reset();
      this.headers = [];
    }

    if (
      [
        common.ConnectionTypeEnum.BigQuery,
        common.ConnectionTypeEnum.GoogleApi
      ].indexOf(type) < 0
    ) {
      this.addConnectionForm.controls['serviceAccountCredentials'].reset();
    }

    if (type !== common.ConnectionTypeEnum.BigQuery) {
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

  toggleSSL() {
    this.isSSL = !this.isSSL;
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
      baseUrl: this.addConnectionForm.value.baseUrl,
      serviceAccountCredentials: common.isDefined(
        this.addConnectionForm.value.serviceAccountCredentials
      )
        ? JSON.parse(this.addConnectionForm.value.serviceAccountCredentials)
        : undefined,
      headers: this.headers,
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
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateConnection,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateConnectionResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let connection = resp.payload.connection;

            let connectionsState = this.connectionsQuery.getValue();
            this.connectionsQuery.update({
              connections: [...connectionsState.connections, connection],
              total: connectionsState.total
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
