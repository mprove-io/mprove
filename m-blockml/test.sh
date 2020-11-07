#

failures=0
trap 'failures=$((failures+1))' ERR
yarn test src/models/1-yaml/tests
if ((failures == 0)); then
  echo "Success"
else
  echo "$failures failures"
  exit 1
fi


