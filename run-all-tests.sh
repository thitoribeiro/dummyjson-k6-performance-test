#!/bin/bash

# Ensure Docker services are up
docker-compose up -d influxdb grafana

# Wait for InfluxDB to be ready
echo "Waiting for InfluxDB to be ready..."
for i in $(seq 1 10); do
  docker-compose logs influxdb | grep "InfluxDB starting" && break
  echo "Attempt $i: InfluxDB not ready yet..."
  sleep 5
done

TEST_FILES=(
  "/scripts/get-categories-details.js"
  "/scripts/get-category-names.js"
  "/scripts/get-products-by-category.js"
  "/scripts/get-products-select-fields.js"
  "/scripts/get-products-sort-asc.js"
  "/scripts/get-products-sort-desc.js"
  "/scripts/get-search-products.js"
  "/scripts/post-add-product.js"
  "/scripts/put-update-product.js"
  "/scripts/search-products.js"
)

for TEST_FILE in "${TEST_FILES[@]}"; do
  echo "Running test: $TEST_FILE"
  docker-compose run --rm k6 run "$TEST_FILE" \
    --env RATE=1 \
    --env TIME_UNIT=1s \
    --env DURATION=5s \
    --env PRE_ALLOCATED_VUS=10 \
    --env MAX_VUS=50
  if [ $? -ne 0 ]; then
    echo "Test $TEST_FILE failed!"
    # Optionally, exit here if you want the script to stop on the first test failure
    # exit 1
  fi
done

# Stop Docker services after tests
docker-compose down
