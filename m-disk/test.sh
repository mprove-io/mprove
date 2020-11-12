#

failures=0
trap 'failures=$((failures+1))' ERR
yarn lint
yarn circular
yarn jest src/controllers/1_organizations/tests
yarn jest src/controllers/2_projects/tests
yarn jest src/controllers/3_repos/tests-1
yarn jest src/controllers/3_repos/tests-2
yarn jest src/controllers/4_catalogs/tests
yarn jest src/controllers/5_branches/tests
yarn jest src/controllers/6_folders/tests
yarn jest src/controllers/7_files/tests
yarn jest src/controllers/8_seed/tests
if ((failures == 0)); then
  echo "Success"
else
  echo "$failures failures"
  exit 1
fi


