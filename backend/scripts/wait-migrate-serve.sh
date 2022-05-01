#!/bin/bash

set -x

# step 1
. "./scripts/connect-to-db.sh"
echo "$(date +'%Y-%m-%d, %H:%M:%S') - waiting for the database to initialize"
connect_to_db

# step 2
echo "$(date +'%Y-%m-%d, %H:%M:%S') - running database-migration scripts against the ${DATABASE_NAME} database"
echo "checking NODE_ENV=${NODE_ENV}"
npm run migration:run  # Forces use of TypeORM's "default" connection!

# step 3
echo "$(date +'%Y-%m-%d, %H:%M:%S') - serving the application"
node dist/server.js
