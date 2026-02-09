#!/bin/bash
export EXPO_PUBLIC_TMDB_API_KEY=$TMDB_API_KEY
cd /home/runner/workspace/apps/mobile

pkill -f "expo start --tunnel" 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true
sleep 2

fuser -k 8081/tcp 2>/dev/null || true
sleep 1

expect auto-tunnel.exp
