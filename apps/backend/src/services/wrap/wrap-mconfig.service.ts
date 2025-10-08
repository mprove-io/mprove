import { Injectable } from '@nestjs/common';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import {
  MconfigLt,
  MconfigSt,
  MconfigTab
} from '~backend/drizzle/postgres/tabs/mconfig-tab';
import { makeMconfigFields } from '~backend/functions/make-mconfig-fields';
import { makeMconfigFiltersX } from '~backend/functions/make-mconfig-filters-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapMconfigService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  tabToApi(item: {
    mconfig: MconfigTab;
    modelFields: ModelField[];
  }): MconfigX {
    let { mconfig, modelFields } = item;

    let mconfigX: MconfigX = {
      structId: mconfig.structId,
      mconfigId: mconfig.mconfigId,
      queryId: mconfig.queryId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      dateRangeIncludesRightSide: mconfig.lt.dateRangeIncludesRightSide,
      storePart: mconfig.lt.storePart,
      modelLabel: mconfig.lt.modelLabel,
      modelFilePath: mconfig.lt.modelFilePath,
      malloyQueryStable: mconfig.lt.malloyQueryStable,
      malloyQueryExtra: mconfig.lt.malloyQueryExtra,
      compiledQuery: mconfig.lt.compiledQuery,
      select: mconfig.lt.select,
      fields: makeMconfigFields({
        modelFields: modelFields,
        select: mconfig.lt.select,
        sortings: mconfig.lt.sortings,
        chart: mconfig.lt.chart
      }),
      extendedFilters: makeMconfigFiltersX({
        modelFields: modelFields,
        mconfigFilters: mconfig.lt.filters
      }),
      sortings: mconfig.lt.sortings,
      sorts: mconfig.lt.sorts,
      timezone: mconfig.lt.timezone,
      limit: mconfig.lt.limit,
      filters: mconfig.lt.filters,
      chart: mconfig.lt.chart,
      temp: mconfig.temp,
      serverTs: mconfig.serverTs
    };

    return mconfigX;
  }

  apiToTab(item: { mconfig: Mconfig }): MconfigTab {
    let { mconfig } = item;

    let mconfigSt: MconfigSt = {};

    let mconfigLt: MconfigLt = {
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

    let mconfigTab: MconfigTab = {
      structId: mconfig.structId,
      queryId: mconfig.queryId,
      mconfigId: mconfig.mconfigId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      temp: mconfig.temp,
      st: mconfigSt,
      lt: mconfigLt,
      serverTs: mconfig.serverTs
    };

    return mconfigTab;
  }

  tabToEnt(mconfig: MconfigTab): MconfigEnt {
    let mconfigEnt: MconfigEnt = {
      ...mconfig,
      st: this.tabService.encrypt({ data: mconfig.st }),
      lt: this.tabService.encrypt({ data: mconfig.lt })
    };

    return mconfigEnt;
  }

  entToTab(mconfig: MconfigEnt): MconfigTab {
    let mconfigTab: MconfigTab = {
      ...mconfig,
      st: this.tabService.decrypt<MconfigSt>({
        encryptedString: mconfig.st
      }),
      lt: this.tabService.decrypt<MconfigLt>({
        encryptedString: mconfig.lt
      })
    };

    return mconfigTab;
  }
}
