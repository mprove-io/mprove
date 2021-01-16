#
failures=0
trap 'failures=$((failures+1))' ERR
(cd "m-backend" && yarn test)
(cd "m-disk" && yarn test)
(cd "m-blockml" && yarn test)
if ((failures == 0)); then
  echo "Success"
else
  echo "$failures failures"
  exit 1
fi


