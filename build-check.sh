#!/bin/bash

# This script is used in read-only CI to check whether or not the
# repo's dist/ directory is up-to-date, and whether or not a new build is required.

DIST_DIR="dist/"
OLD_SUM=$(find dist -type f -exec shasum {} + | shasum | awk '{print $1}')

RES=$(deno run build)

# Check for build failure
CODE=$?
if [ $CODE -ne 0 ]; then
  echo "Build failed with code $CODE"
  exit $CODE
fi

NEW_SUM=$(find dist -type f -exec shasum {} + | shasum | awk '{print $1}')

if [ "$OLD_SUM" != "$NEW_SUM" ]; then
  echo "Build required."
  exit 1
else
  echo "No build required."
  exit 0
fi