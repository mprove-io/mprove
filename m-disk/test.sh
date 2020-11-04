#

failures=0
trap 'failures=$((failures+1))' ERR
yarn test src/controllers/1_organizations/tests
yarn test src/controllers/2_projects/tests
yarn test src/controllers/3_repos/tests-1
yarn test src/controllers/3_repos/tests-2
yarn test src/controllers/4_catalogs/tests
yarn test src/controllers/5_branches/tests
yarn test src/controllers/6_folders/tests
yarn test src/controllers/7_files/tests
yarn test src/controllers/8_seed/tests
if ((failures == 0)); then
  echo "Success"
else
  echo "$failures failures"
  exit 1
fi

