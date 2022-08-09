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
        "env": [
          {
            "name": "BLOCKML_LOG_IO",
            "value": "TRUE"
          }
        ],
        "envFrom": [
          {
            "secretRef": {
              "name": "blockml-single-envs"
            }
          }
        ]
      }
    ]
  }
}' \
  blockml --dev -- yarn test:blockml

