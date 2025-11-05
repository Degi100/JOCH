#!/bin/bash
# Fix all service files to handle undefined response.data

for file in bandMember.service.ts contact.service.ts news.service.ts song.service.ts gallery.service.ts; do
  echo "Fixing $file..."
  # Replace array returns with || []
  sed -i 's/return response\.data;$/return response.data || [];/g' "$file"
  # Replace single object returns with throw checks (will need manual fix for specific errors)
  # This is a simplification - we'll handle it differently
done
