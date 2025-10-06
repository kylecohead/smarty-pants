#!/bin/sh
set -e

echo "Waiting for Postgres..."
until pg_isready -h db -U postgres -d trivia; do
  sleep 2
done

echo "Syncing schema with Prisma..."
npx prisma db push

echo "Generating client..."
npx prisma generate

echo "Seeding database..."
node prisma/seed.js || echo "Seed failed, continuing..."

echo "Starting backend..."
npm run dev
