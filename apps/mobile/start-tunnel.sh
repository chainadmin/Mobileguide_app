#!/bin/bash
export EXPO_PUBLIC_TMDB_API_KEY=$TMDB_API_KEY
cd /home/runner/workspace/apps/mobile
expect auto-tunnel.exp
