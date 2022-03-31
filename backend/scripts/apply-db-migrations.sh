#!/bin/bash

set -x

# step 1
. "./scripts/connect-to-db.sh"
echo "$(date +'%Y-%m-%d, %H:%M:%S') - waiting for the database to initialize"
connect_to_db

# step 2
echo "$(date +'%Y-%m-%d, %H:%M:%S') - running database-migration scripts against the ${DATABASE_NAME} database"
npm run migration:run -- \
    -c connection-to-db-for-dev
