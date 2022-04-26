docker container rm -f \
    container-journal-keeper-mysql \
    container-journal-keeper-database-server \
    container-journal-keeper-backend-build-stage \
    container-journal-keeper-backend-prod-stage \
    container-journal-keeper-frontend-build-stage \
    container-journal-keeper-frontend-prod-stage

docker volume prune

docker network prune

docker image prune
