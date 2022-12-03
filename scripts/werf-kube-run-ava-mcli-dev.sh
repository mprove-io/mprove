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
              "name": "mcli-envs"
            }
          }
        ]
      }
    ]    
  }
}' \
  mcli --dev -- yarn ava:mcli


