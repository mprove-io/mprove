werf kube-run --repo ghcr.io/mprove-io/mprove --overrides='{
  "spec": {
    "imagePullSecrets": [
      {
        "name": "registrysecret"
      }
    ]
  }
}' \
  integra --dev -- yarn run nx e2e front-e2e -c production


