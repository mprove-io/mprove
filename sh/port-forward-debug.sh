kubectl port-forward services/disk 9230:9230 -n mprove \
  & kubectl port-forward services/backend 9231:9231 -n mprove \
  & kubectl port-forward services/backend-scheduler 9232:9232 -n mprove \
  & kubectl port-forward services/blockml-single 9233:9233 -n mprove \
  & kubectl port-forward services/blockml-main 9234:9234 -n mprove \
  & kubectl port-forward services/blockml-worker 9235:9235 -n mprove