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
            "name": "BLOCKML_IS_SINGLE",
            "value": "TRUE"
          },                 
          {
            "name": "BLOCKML_LOG_IO",
            "value": "TRUE"
          }
        ],
        "envFrom": [
          {
            "secretRef": {
              "name": "blockml-common-envs"
            }
          }
        ]
      }
    ]
  }
}' \
  blockml --dev -- yarn test:blockml

