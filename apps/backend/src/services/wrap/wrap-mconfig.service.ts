import { Injectable } from '@nestjs/common';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapMconfigService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToApiMconfig(item: {
    mconfig: MconfigEnt;
    modelFields: ModelField[];
  }): MconfigX {
    let { mconfig, modelFields } = item;

    let mconfigTab = this.tabService.decrypt<MconfigTab>({
      encryptedString: mconfig.tab
    });

    let apiMconfig: MconfigX = {
      structId: mconfig.structId,
      mconfigId: mconfig.mconfigId,
      queryId: mconfig.queryId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      dateRangeIncludesRightSide: mconfigTab.dateRangeIncludesRightSide,
      storePart: mconfigTab.storePart,
      modelLabel: mconfigTab.modelLabel,
      modelFilePath: mconfigTab.modelFilePath,
      malloyQueryStable: mconfigTab.malloyQueryStable,
      malloyQueryExtra: mconfigTab.malloyQueryExtra,
      compiledQuery: mconfigTab.compiledQuery,
      select: mconfigTab.select,
      fields: makeMconfigFields({
        modelFields: modelFields,
        select: mconfigTab.select,
        sortings: mconfigTab.sortings,
        chart: mconfigTab.chart
      }),
      extendedFilters: makeMconfigFiltersX({
        modelFields: modelFields,
        mconfigFilters: mconfigTab.filters
      }),
      sortings: mconfigTab.sortings,
      sorts: mconfigTab.sorts,
      timezone: mconfigTab.timezone,
      limit: mconfigTab.limit,
      filters: mconfigTab.filters,
      chart: mconfigTab.chart,
      temp: mconfig.temp,
      serverTs: mconfig.serverTs
    };

    return apiMconfig;
  }

  wrapToEntityMconfig(item: { mconfig: Mconfig }): MconfigEnt {
    let { mconfig } = item;

    let mconfigTab: MconfigTab = {
      dateRangeIncludesRightSide: mconfig.dateRangeIncludesRightSide,
      storePart: mconfig.storePart,
      modelLabel: mconfig.modelLabel,
      modelFilePath: mconfig.modelFilePath,
      malloyQueryStable: mconfig.malloyQueryStable,
      malloyQueryExtra: mconfig.malloyQueryExtra,
      compiledQuery: mconfig.compiledQuery,
      select: mconfig.select,
      sortings: mconfig.sortings,
      sorts: mconfig.sorts,
      timezone: mconfig.timezone,
      limit: mconfig.limit,
      filters: mconfig.filters,
      chart: mconfig.chart
    };

    let mconfigEnt: MconfigEnt = {
      structId: mconfig.structId,
      queryId: mconfig.queryId,
      mconfigId: mconfig.mconfigId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      temp: mconfig.temp,
      tab: this.tabService.encrypt({ data: mconfigTab }),
      serverTs: mconfig.serverTs
    };

    return mconfigEnt;
  }
}
