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
          "secretName": "backend-common-bigquery",
          "items": [
            {
              "key": "content",
              "path": "bigquery-test.json"
            }
          ]          
        }
      }
    ]    
  }
}' \
  backend --dev -- yarn e2e:backend


