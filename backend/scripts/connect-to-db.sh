function connect_to_db() {
    if [ "$NODE_ENV" = "prod" ]  # i.e. running the D. image's `prod-stage` target
    then
        DB_USERNAME=${TYPEORM_USERNAME}
        DB_PASSWORD=${TYPEORM_PASSWORD}
        DB_HOST=${TYPEORM_HOST}
        DB_PORT=${TYPEORM_PORT}
    else   # i.e. running the D. image's `build-stage` target
        DB_USERNAME=${DATABASE_USERNAME}
        DB_PASSWORD=${DATABASE_PASSWORD}
        DB_HOST=${DATABASE_HOSTNAME}
        DB_PORT=${DATABASE_PORT}
    fi


    success=0
    for i in $(seq 15); do
        echo "$(date +'%Y-%m-%d, %H:%M:%S') - attempt #${i} at connecting to the database"
        # TODO: Determine how to prevent
        #       the following variables' values
        #       from being printed to the console in clear text
        if mysql \
            --user=${DB_USERNAME} \
            --password=${DB_PASSWORD} \
            --host=${DB_HOST} \
            --port=${DB_PORT} \
            --protocol=TCP \
            --execute="SELECT true;"
        then
            success=1
            break
        else
            echo "$(date +'%Y-%m-%d, %H:%M:%S') - pausing before next attempt"
            sleep 5
        fi
    done

    if [ "$success" -eq 0 ]
    then
        echo "$(date +'%Y-%m-%d, %H:%M:%S') - failed to connect to the database at ${DB_HOST}:${DB_PORT}... aborting the execution!"
        exit 1
    else  # i.e. `success` equals `1`
        echo "$(date +'%Y-%m-%d, %H:%M:%S') - succeeded in connecting to the database at ${DB_HOST}:${DB_PORT}"
    fi
}

export -f connect_to_db
