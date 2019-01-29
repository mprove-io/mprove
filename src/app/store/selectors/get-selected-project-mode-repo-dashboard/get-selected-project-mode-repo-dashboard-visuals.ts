import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoDashboardReports } from '@app/store/selectors/get-selected-project-mode-repo-dashboard/get-selected-project-mode-repo-dashboard-reports';

import { getSelectedProjectModeRepoId } from '@app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';

import { getSelectedProjectModeRepoStructId } from '@app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-struct-id';
import { getSelectedProjectId } from '@app/store/selectors/get-selected-project/get-selected-project-id';
import { getMconfigsState } from '@app/store/selectors/get-state/get-mconfigs-state';
import { getModelsState } from '@app/store/selectors/get-state/get-models-state';
import { getQueriesState } from '@app/store/selectors/get-state/get-queries-state';
import { getUserAlias } from '@app/store/selectors/get-user/get-user-alias';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';

export const getSelectedProjectModeRepoDashboardVisuals = createSelector(
  getSelectedProjectModeRepoDashboardReports,
  getMconfigsState,
  getQueriesState,
  getModelsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getSelectedProjectModeRepoStructId,
  getUserAlias,
  (
    reports: api.Report[],
    mconfigs: api.Mconfig[],
    queries: api.Query[],
    models: api.Model[],
    projectId: string,
    repoId: string,
    repoStructId: string,
    userAlias: string
  ) => {
    if (
      reports &&
      mconfigs &&
      queries &&
      models &&
      projectId &&
      repoId &&
      userAlias
    ) {
      let visuals: interfaces.Visual[] = [];

      let next: boolean = false;

      reports.forEach(report => {
        if (next) {
          return;
        }

        let query = queries.find(q => q.query_id === report.query_id);

        if (!query) {
          next = true;
          return;
        }

        let mconfig = mconfigs.find(m => m.mconfig_id === report.mconfig_id);

        if (!mconfig) {
          next = true;
          return;
        }

        let model = models.find(
          (m: api.Model) =>
            m.model_id === mconfig.model_id &&
            m.project_id === projectId &&
            m.repo_id === repoId &&
            m.struct_id === repoStructId
        );

        if (!model) {
          next = true;
          return;
        }

        let selectFields: api.ModelField[] = [];

        let selectDimensions: api.ModelField[] = [];
        let selectMeasures: api.ModelField[] = [];
        let selectCalculations: api.ModelField[] = [];

        mconfig.select.forEach((fieldId: string) => {
          let field = model.fields.find(f => f.id === fieldId);

          if (field.field_class === api.ModelFieldFieldClassEnum.Dimension) {
            selectDimensions.push(field);
          } else if (
            field.field_class === api.ModelFieldFieldClassEnum.Measure
          ) {
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

        visuals.push({
          query: query,
          mconfig: mconfig,
          chart: mconfig.charts[0],
          select_fields: selectFields,
          is_model_hidden: model.hidden,
          has_access_to_model:
            model.access_users.length === 0 ||
            model.access_users.findIndex(element => element === userAlias) > -1
        });
      });

      return visuals;
    } else {
      return undefined;
    }
  }
);
