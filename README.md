# Mobileguide Monorepo

This repository contains a mobile app and API service for the Mobileguide project.

## Structure

- `apps/mobile`: Expo React Native app (TypeScript).
- `apps/api`: Node.js + Express API (TypeScript).
- `db/migrations`: SQL migration files.

## Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)
- Expo Go or iOS/Android simulator for running the mobile app

## Install dependencies

From the repo root:

```bash
npm install
```

## Run the mobile app

```bash
cd apps/mobile
npm install
npm run start
```

## Run the API

```bash
cd apps/api
npm install
npm run dev
```

The API defaults to `http://localhost:4000`.

## Migrations

SQL migration files live in `db/migrations`. Apply them with your preferred tooling.
