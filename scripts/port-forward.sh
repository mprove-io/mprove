while true; do kubectl port-forward services/db 3306:3306 -n mprove; done \
  & while true; do kubectl port-forward services/rabbit 5672:5672 -n mprove; done \
  & while true; do kubectl port-forward services/frontnode 4200:4200 -n mprove; done \
  & while true; do kubectl port-forward services/disk 9230:9230 -n mprove; done \
  & while true; do kubectl port-forward services/backend 3000:3000 -n mprove; done \
  & while true; do kubectl port-forward services/backend 9231:9231 -n mprove; done \
  & while true; do kubectl port-forward services/backend-scheduler 9232:9232 -n mprove; done \
  # & while true; do kubectl port-forward services/blockml-main 9234:9234 -n mprove; done \
  # & while true; do kubectl port-forward services/blockml-worker 9235:9235 -n mprove; done \
  & while true; do kubectl port-forward services/blockml-single 9233:9233 -n mprove; done 

# pkill -f "port-forward"