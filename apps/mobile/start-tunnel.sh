#!/bin/bash
export EXPO_PUBLIC_TMDB_API_KEY=$TMDB_API_KEY
export EXPO_NO_TTY=1

printf '\x1b[B\n' | npx expo start --tunnel --port 5000
