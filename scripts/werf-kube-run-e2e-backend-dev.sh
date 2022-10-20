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
            "name": "BACKEND_FIRST_PROJECT_REMOTE_TYPE",
            "value": "Managed"
          }
        ],
        "envFrom": [
          {
            "secretRef": {
              "name": "backend-common-envs"
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
              "key": "contentBigquery",
              "path": "bigquery-test.json"
            },
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
  backend --dev -- yarn e2e:backend


