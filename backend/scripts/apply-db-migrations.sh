#!/bin/bash

set -x

# step 1
. "./scripts/connect-to-db.sh"
echo "waiting for the database to initialize"
connect_to_db

# step 2
echo "running database-migration scripts against the ${DATABASE_NAME} database"
npm run migration:run -- \
    -c connection-to-db-for-dev
