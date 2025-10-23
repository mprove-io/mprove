import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  BehaviorSubject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
  tap
} from 'rxjs';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { sleep } from '~common/functions/sleep';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
import {
  ToBackendSuggestDimensionValuesRequestPayload,
  ToBackendSuggestDimensionValuesResponse
} from '~common/interfaces/to-backend/mconfigs/to-backend-suggest-dimension-values';
import {
  ToBackendGetQueryRequestPayload,
  ToBackendGetQueryResponse
} from '~common/interfaces/to-backend/queries/to-backend-get-query';
import {
  ToBackendRunQueriesRequestPayload,
  ToBackendRunQueriesResponse
} from '~common/interfaces/to-backend/queries/to-backend-run-queries';
import { MyRegex } from '~common/models/my-regex';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';

@Component({
  standalone: false,
  selector: 'm-store-fraction-input',
  templateUrl: 'store-fraction-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
// implements OnInit
export class StoreFractionInputComponent implements OnInit, OnDestroy {
  @ViewChild('fractioInputValueSelect', { static: false })
  fractioInputValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractioInputValueSelectElement?.close();
  }

  defaultStringValue = 'abc';
  fractionTypeEnum = FractionTypeEnum;
  fieldClassEnum = FieldClassEnum;

  isStoreSuggestEnabled = false; // experimental

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() chartId: string;
  @Input() dashboardId: string;
  @Input() reportId: string;
  @Input() rowId: string;

  @Input() fraction: Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;
  @Input() isDisabled: boolean;
  @Input() fractionControl: FractionControl;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionForm: FormGroup;

  loading = false;
  items: any[] = [];
  searchInput$ = new BehaviorSubject<string>('');

  searchValue: string;

  searchSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.buildFractionForm();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onCloseSelect() {
    this.searchValue = '';
    this.items = [];

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onOpenSelect() {
    if (
      this.isStoreSuggestEnabled === true &&
      isDefined(this.suggestModelDimension) &&
      (this.fraction.type === FractionTypeEnum.StringIsEqualTo ||
        this.fraction.type === FractionTypeEnum.StringIsNotEqualTo)
    ) {
      let reg = MyRegex.CAPTURE_SUGGEST_MODEL_FIELD_G();

      let r = reg.exec(this.suggestModelDimension);

      let modelId = r[1];
      let fieldId = r[2];

      this.searchSubscription = this.searchInput$
        .pipe(
          debounceTime(300), // Wait 300 ms after user stops typing
          distinctUntilChanged(), // Only trigger if the input has changed
          switchMap(async term => {
            try {
              this.loading = true;
              this.cd.detectChanges();

              // let newMconfig: Mconfig = {
              //   structId: this.structId,
              //   mconfigId: makeId(),
              //   queryId: makeId(),
              //   modelId: modelId,
              //   modelType: ModelTypeEnum.Store,
              //   parentType: MconfigParentTypeEnum.SuggestDimension,
              //   parentId: undefined,
              //   // isStoreModel:
              //   //   this.fraction.type === FractionTypeEnum.StoreFraction,
              //   dateRangeIncludesRightSide: undefined, // adjustMconfig overrides it
              //   storePart: undefined,
              //   modelLabel: 'empty',
              //   modelFilePath: undefined,
              //   malloyQueryStable: undefined,
              //   malloyQueryExtra: undefined,
              //   compiledQuery: undefined,
              //   select: [fieldId],
              //   // unsafeSelect: [],
              //   // warnSelect: [],
              //   // joinAggregations: [],
              //   sortings: [],
              //   sorts: `${fieldId}`,
              //   timezone: UTC,
              //   limit: 500,
              //   filters: isDefinedAndNotEmpty(term)
              //     ? [
              //         {
              //           fieldId: fieldId,
              //           fractions: [
              //             {
              //               brick: `%${term}%`,
              //               type: FractionTypeEnum.StringContains,
              //               operator: FractionOperatorEnum.Or
              //             }
              //           ]
              //         }
              //       ]
              //     : [],
              //   chart: makeCopy(DEFAULT_CHART),
              //   serverTs: 1
              // };

              let nav = this.navQuery.getValue();

              let payload: ToBackendSuggestDimensionValuesRequestPayload = {
                projectId: nav.projectId,
                isRepoProd: nav.isRepoProd,
                branchId: nav.branchId,
                envId: nav.envId,
                structId: this.structId,
                modelId: modelId,
                fieldId: fieldId,
                chartId: this.chartId,
                dashboardId: this.dashboardId,
                reportId: this.reportId,
                rowId: this.rowId,
                term: term,
                cellMetricsStartDateMs: undefined,
                cellMetricsEndDateMs: undefined
              };

              let q1Resp = await this.apiService
                .req({
                  pathInfoName:
                    ToBackendRequestInfoNameEnum.ToBackendSuggestDimensionValues,
                  payload: payload
                })
                .pipe(
                  tap((resp: ToBackendSuggestDimensionValuesResponse) => {
                    if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
                      return resp;
                    }
                  }),
                  take(1)
                )
                .toPromise();

              let q2Resp = await this.apiService
                .req({
                  pathInfoName:
                    ToBackendRequestInfoNameEnum.ToBackendRunQueries,
                  payload: {
                    projectId: nav.projectId,
                    isRepoProd: nav.isRepoProd,
                    branchId: nav.branchId,
                    envId: nav.envId,
                    mconfigIds: [q1Resp.payload.mconfig.mconfigId]
                    // queryIds: [q1Resp.payload.query.queryId]
                  } as ToBackendRunQueriesRequestPayload
                })
                .pipe(
                  tap((resp: ToBackendRunQueriesResponse) => {
                    if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
                      return resp;
                    }
                  }),
                  take(1)
                )
                .toPromise();

              let q3Resp: ToBackendGetQueryResponse;

              while (
                isUndefined(q3Resp) ||
                q3Resp?.payload.query.status === QueryStatusEnum.Running
              ) {
                await sleep(500);

                q3Resp = await this.apiService
                  .req({
                    pathInfoName:
                      ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                    payload: {
                      projectId: nav.projectId,
                      isRepoProd: nav.isRepoProd,
                      branchId: nav.branchId,
                      envId: nav.envId,
                      mconfigId: q1Resp.payload.mconfig.mconfigId,
                      queryId: q2Resp.payload.runningQueries[0].queryId
                    } as ToBackendGetQueryRequestPayload
                  })
                  .pipe(
                    tap((resp: ToBackendGetQueryResponse) => {
                      if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
                        return resp;
                      }
                    })
                  )
                  .toPromise();
              }

              this.items = isDefined(q3Resp?.payload?.query?.data)
                ? q3Resp.payload.query.data.map((row: any, i: number) => ({
                    id: i,
                    name: row[fieldId]
                  }))
                : [];

              if (isDefinedAndNotEmpty(this.searchValue)) {
                this.items = [
                  {
                    id: 0,
                    name: this.searchValue
                  },
                  ...this.items.map(item => {
                    let newItem = Object.assign(item, {
                      id: item.id + 1
                    });

                    return newItem;
                  })
                ];
              }

              if (q3Resp?.payload.query.status === QueryStatusEnum.Error) {
                throw new Error(
                  `Suggest Values Query Error: ${q3Resp.payload.query.lastErrorMessage}`
                );
              }
            } catch (error: any) {
              this.loading = false;
              this.cd.detectChanges();

              throw new Error(
                `Failed to get filter suggestions: ${error.message}`
              );
            }

            this.loading = false;
            this.cd.detectChanges();

            return;
          })
        )
        .subscribe();
    }
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      inputValue: [
        this.fractionControl.value,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });
  }

  inputValueSearch(searchObj: any) {
    this.searchValue = searchObj.term;
  }

  inputValueChange(item: { value: string; label: string }) {
    (document.activeElement as HTMLElement).blur();

    let newControl = makeCopy(this.fractionControl);

    newControl.value = item.value;

    let newFraction = makeCopy(this.fraction);

    let controlIndex = newFraction.controls.findIndex(
      control => control.name === this.fractionControl.name
    );

    newFraction.controls = [
      ...newFraction.controls.slice(0, controlIndex),
      newControl,
      ...newFraction.controls.slice(controlIndex + 1)
    ];

    this.fraction = newFraction;

    this.emitFractionUpdate();
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  inputValueBlur() {
    let value = this.fractionForm.controls['inputValue'].value;

    if (value !== this.fractionControl.value) {
      let newControl = makeCopy(this.fractionControl);

      newControl.value = value;

      let newFraction = makeCopy(this.fraction);

      let controlIndex = newFraction.controls.findIndex(
        control => control.name === this.fractionControl.name
      );

      newFraction.controls = [
        ...newFraction.controls.slice(0, controlIndex),
        newControl,
        ...newFraction.controls.slice(controlIndex + 1)
      ];

      this.fraction = newFraction;

      if (this.fractionForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }
}
