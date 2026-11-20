#!/bin/bash
# start-server.sh - Lancement fiable du serveur Xobeez

cd /home/ubuntu/projects/xobeez-backend
go run cmd/api/main.go > /tmp/xobeez.log 2>&1 &
PID=$!
echo $PID > /tmp/xobeez.pid
echo "Server launched with PID $PID"
echo "Waiting 3 seconds..."
sleep 3
echo "Server should be running. Sending test request..."
curl -s http://localhost:8082/v1/missions/1 | head -c 500 || echo "Failed to connect"