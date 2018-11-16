require('ts-node/register');
const ports = require('../constants');
const helpers = require('../helpers');

let port;
helpers.hasProcessFlag('universal')
  ? (port = ports.UNIVERSAL_PORT)
  : (port = ports.E2E_PORT);

exports.config = {
  allScriptsTimeout: 110000,
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['window-size=2360,1240', 'show-fps-counter=true']
    }
  },
  directConnect: true,
  baseUrl: `http://localhost:${port}/`,

  // Specs here are the cucumber feature files

  specs: [
    './e2e/features/system/system-begin.feature', //

    './e2e/features/soft/soft-check-title.feature',
    './e2e/features/soft/soft-delete-token.feature', //

    './e2e/features/login/login-check-title.feature',
    './e2e/features/login/login-log-in-with-email.feature', //

    './e2e/features/profile/profile-check-title.feature',
    './e2e/features/profile/profile-check-fields.feature',
    './e2e/features/profile/profile-change-name.feature',
    './e2e/features/profile/profile-change-timezone.feature',

    './e2e/features/space/space-new-project.feature', //
    './e2e/features/space/space-set-mode-prod.feature',
    './e2e/features/space/space-set-mode-dev.feature',

    './e2e/features/team/team-check-title.feature',
    './e2e/features/team/team-check-user-fields.feature',
    './e2e/features/team/team-invite-member.feature',
    './e2e/features/team/team-set-member-is-admin.feature',
    './e2e/features/team/team-set-member-is-editor.feature',
    './e2e/features/team/team-unset-member-is-admin.feature',
    './e2e/features/team/team-unset-member-is-editor.feature',
    './e2e/features/team/team-delete-member.feature',

    './e2e/features/project-settings/project-settings-check-title.feature',
    './e2e/features/project-settings/project-settings-check-fields.feature',
    './e2e/features/project-settings/project-settings-update-credentials.feature', //
    './e2e/features/project-settings/project-settings-change-query-size-limit.feature',
    './e2e/features/project-settings/project-settings-change-timezone.feature',
    './e2e/features/project-settings/project-settings-change-week-start.feature',

    './e2e/features/blockml/blockml-check-title.feature',
    './e2e/features/blockml/blockml-create-folder-shop.feature',
    './e2e/features/blockml/blockml-create-file-sales-view.feature',
    './e2e/features/blockml/blockml-edit-file-sales-view.feature',
    './e2e/features/blockml/blockml-revert-repo-to-production.feature',

    './e2e/features/blockml/blockml-edit-file-readme-md-123.feature',
    './e2e/features/blockml/blockml-commit.feature',
    './e2e/features/blockml/blockml-edit-file-readme-md-456.feature',
    './e2e/features/blockml/blockml-revert-repo-to-last-commit.feature',
    './e2e/features/blockml/blockml-push-to-production.feature',
    './e2e/features/blockml/blockml-prod-check-readme-md-123.feature',

    './e2e/features/blockml/blockml-edit-file-readme-md-7.feature',
    './e2e/features/blockml/blockml-commit.feature',

    './e2e/features/team/team-invite-member-b2.feature',
    './e2e/features/team/team-set-member-is-editor-b2.feature',
    './e2e/features/profile/profile-logout.feature',

    './e2e/features/login/login-log-in-with-email-b2.feature',
    './e2e/features/blockml/blockml-edit-file-readme-md-8-b2.feature',
    './e2e/features/blockml/blockml-commit-b2.feature',
    './e2e/features/blockml/blockml-push-to-production-b2.feature',
    './e2e/features/profile/profile-logout.feature',

    './e2e/features/login/login-log-in-with-email.feature',
    './e2e/features/blockml/blockml-pull.feature',
    './e2e/features/blockml/blockml-conflicts.feature',
    './e2e/features/blockml/blockml-revert-repo-to-production.feature',
    './e2e/features/blockml/blockml-dev-check-readme-md-8.feature',

    './e2e/features/query/dev-query-filters-string.feature',
    './e2e/features/query/dev-query-filters-yesno.feature',
    './e2e/features/query/dev-query-filters-month-name.feature',
    './e2e/features/query/dev-query-filters-quarter-of-year.feature',
    './e2e/features/query/dev-query-filters-day-of-week.feature',
    './e2e/features/query/dev-query-filters-day-of-week-index.feature',
    './e2e/features/query/dev-query-filters-number.feature',
    './e2e/features/query/dev-query-filters-ts-1.feature',
    './e2e/features/query/dev-query-filters-ts-2.feature',
    './e2e/features/query/dev-query-filters-ts-3.feature',
    './e2e/features/query/dev-query-filters-ts-4.feature',
    './e2e/features/query/dev-query-table.feature',

    './e2e/features/chart/dev-chart-table.feature',
    './e2e/features/chart/dev-chart-bar-vertical.feature',
    './e2e/features/chart/dev-chart-bar-horizontal.feature',
    './e2e/features/chart/dev-chart-pie.feature',
    './e2e/features/chart/dev-chart-pie-advanced.feature',
    './e2e/features/chart/dev-chart-pie-grid.feature',
    './e2e/features/chart/dev-chart-tree-map.feature',
    './e2e/features/chart/dev-chart-number-card.feature',
    './e2e/features/chart/dev-chart-gauge.feature',

    './e2e/features/chart/dev-chart-bar-vertical-grouped.feature',
    './e2e/features/chart/dev-chart-bar-horizontal-grouped.feature',
    './e2e/features/chart/dev-chart-bar-vertical-stacked.feature',
    './e2e/features/chart/dev-chart-bar-horizontal-stacked.feature',
    './e2e/features/chart/dev-chart-bar-vertical-normalized.feature',
    './e2e/features/chart/dev-chart-bar-horizontal-normalized.feature',
    './e2e/features/chart/dev-chart-heat-map.feature',

    './e2e/features/chart/dev-chart-line.feature',
    './e2e/features/chart/dev-chart-area.feature',
    './e2e/features/chart/dev-chart-area-stacked.feature',
    './e2e/features/chart/dev-chart-area-normalized.feature',

    './e2e/features/chart/dev-chart-gauge-linear.feature',

    './e2e/features/remote/remote-check-title.feature',
    './e2e/features/pdts/pdts-check-title.feature',
    './e2e/features/billing/billing-check-title.feature',

    // './e2e/features/project-settings/project-settings-delete-project.feature',               // //
    './e2e/features/profile/profile-logout.feature', //
    './e2e/features/system/system-end.feature' //
  ],

  // Use a custom framework adapter and set its relative path
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  exclude: [],

  // cucumber command line options
  cucumberOpts: {
    // require step definition files before executing features
    require: ['./e2e/steps/**/*.ts'],
    // <string[]> (expression) only execute the features or scenarios with tags matching the expression
    // tags: [],
    // <boolean> fail if there are any undefined or pending steps
    strict: true,
    // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
    format: ['json:reports/summary.json'],
    // <boolean> invoke formatters without executing steps
    dryRun: false,
    // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    compiler: []
  },

  onPrepare: function() {
    browser.ignoreSynchronization = true;

    // Enable TypeScript for the tests
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });

    // setTimeout(() => {
    //   browser.driver.executeScript(() => {
    //     return [
    //       window.screen.availWidth,
    //       window.screen.availHeight
    //     ];
    //   }).then((result) => {
    //     browser.driver.manage().window().setPosition(0, 0);
    //     browser.driver.manage().window().setSize(result[0], result[1]);
    //   });
    // });
  },

  /**
   * Angular 2 configuration
   *
   * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
   * `rootEl`
   */
  useAllAngular2AppRoots: true
};
