#!/bin/bash

set -x

# step 1
. "./scripts/connect-to-db.sh"
echo "waiting for the database to initialize"
connect_to_db

# step 2
echo "running database-migration scripts against the ${DATABASE_NAME} database"
echo "checking NODE_ENV=${NODE_ENV}"
npm run migration:run  # Forces use of TypeORM's "default" connection!

# step 3
echo "serving the application"
node dist/server.js
