import { createSelector } from '@ngrx/store';
import { getSelectedMconfigChart } from '@app/store/selectors/get-selected-mconfig-chart/get-selected-mconfig-chart';
import { getSelectedMconfig } from '@app/store/selectors/get-selected-mconfig/get-selected-mconfig';
import { getSelectedProjectModeRepoModel } from '@app/store/selectors/get-selected-project-mode-repo-model/get-selected-project-mode-repo-model';
import { getSelectedQuery } from '@app/store/selectors/get-selected-query/get-selected-query';
import { getUserAlias } from '@app/store/selectors/get-user/get-user-alias';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';

export const getSelectedVisual = createSelector(
  getSelectedMconfig,
  getSelectedQuery,
  getSelectedMconfigChart,
  getSelectedProjectModeRepoModel,
  getUserAlias,
  (
    mconfig: api.Mconfig,
    query: api.Query,
    chart: api.Chart,
    model: api.Model,
    userAlias: string
  ) => {
    if (mconfig && query && chart && model && userAlias) {
      let selectFields: api.ModelField[] = [];

      let selectDimensions: api.ModelField[] = [];
      let selectMeasures: api.ModelField[] = [];
      let selectCalculations: api.ModelField[] = [];

      mconfig.select.forEach((fieldId: string) => {
        let field = model.fields.find(f => f.id === fieldId);

        if (field.field_class === api.ModelFieldFieldClassEnum.Dimension) {
          selectDimensions.push(field);
        } else if (field.field_class === api.ModelFieldFieldClassEnum.Measure) {
          selectMeasures.push(field);
        } else if (
          field.field_class === api.ModelFieldFieldClassEnum.Calculation
        ) {
          selectCalculations.push(field);
        }

        selectFields = [
          ...selectDimensions,
          ...selectMeasures,
          ...selectCalculations
        ];
      });

      let visual: interfaces.Visual = {
        query: query,
        mconfig: mconfig,
        chart: chart,
        select_fields: selectFields,
        is_model_hidden: model.hidden,
        has_access_to_model:
          model.access_users.length === 0 ||
          model.access_users.findIndex(element => element === userAlias) > -1
      };

      return visual;
    } else {
      return undefined;
    }
  }
);
