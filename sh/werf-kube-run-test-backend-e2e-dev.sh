werf kube-run --repo ghcr.io/mprove-io/mprove --overrides='{
  "spec": {
    "imagePullSecrets": [
      {
        "name": "registrysecret"
      }
    ],
    "containers": [
      {
        "name": "%container_name%",
        "envFrom": [
          {
            "secretRef": {
              "name": "backend-envs"
            }
          }
        ]
      }
    ]
  }
}' \
  backend --dev -- yarn e2e:backend


