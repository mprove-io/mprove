sh scripts/werf-kube-run-test-disk-dev.sh \
  && sh scripts/werf-kube-run-test-blockml-dev.sh \
  && sh scripts/werf-kube-run-e2e-backend-dev.sh \
  && sh scripts/werf-kube-run-e2e-integra-dev.sh
  
  # && sh scripts/werf-kube-run-ava-mcli-dev.sh \