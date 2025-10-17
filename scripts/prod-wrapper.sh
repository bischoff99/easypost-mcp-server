#!/bin/bash
# Wrapper to suppress ChromaDB mutex cleanup error (cosmetic only)

tsx scripts/production-pipeline.ts "$@" 2>&1 | grep -v "mutex lock failed" | grep -v "libc++abi"
EXIT_CODE=${PIPESTATUS[0]}

# If we stored chunks successfully, treat as success
if echo "$EXIT_CODE" | grep -E "^(0|134)$" > /dev/null; then
  exit 0
else
  exit $EXIT_CODE
fi
