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
        ],
        "volumeMounts": [
          {
            "name": "secrets-volume",
            "mountPath": "/usr/src/app/secrets"
          }
        ]        
      }
    ],
    "volumes": [
      {
        "name": "secrets-volume",
        "secret": {
          "secretName": "backend-common-secret-files",
          "items": [
            {
              "key": "contentRemotePrivateKey",
              "path": "first-project-remote-private-key.pem"
            },
            {
              "key": "contentRemotePublicKey",
              "path": "first-project-remote-public-key.pem"
            }
          ]          
        }
      }
    ]
  }
}' \
  mcli --dev -- yarn ava:mcli


