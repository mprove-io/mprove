

# DOMAIN
export DOMAIN="http://localhost:8080"
#export DOMAIN="https://dev.mprove.io"
#export DOMAIN="https://arhar.online"

curl $DOMAIN/api/v1/projects.checkProjectIdUnique \
-H "Authorization: $BEARER" \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-X POST \
-d @sh/authorization_error_check_project_id_unique.json