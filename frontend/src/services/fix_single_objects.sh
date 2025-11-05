#!/bin/bash
# Fix single object returns - they should throw, not return []

for file in bandMember.service.ts contact.service.ts news.service.ts song.service.ts; do
  echo "Processing $file..."
  # For getById, create, update methods - replace || [] with throw check
  sed -i 's/return response\.data || \[\];$/if (!response.data) throw new Error("Not found"); return response.data;/g' "$file"
done
