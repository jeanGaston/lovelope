#!/bin/sh
set -e

chown -R nextjs:nodejs /app/data

exec su-exec nextjs sh -c "npx prisma migrate deploy && node server.js"
