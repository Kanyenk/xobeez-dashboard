#!/bin/bash
# Test script for Xobeez API

echo "Starting server..."
/tmp/xobeez-server &
SERVER_PID=$!
sleep 3

echo "=== TEST 1: POST /v1/missions ==="
curl -s -X POST -H "Content-Type: application/json" -d '{"client_id":"mvp_flower","freelancer_id":"mvp_bee","amount":300000,"currency":"EUR"}' http://localhost:8083/v1/missions
echo ""

echo "=== TEST 2: GET /v1/missions/6 ==="
curl -s http://localhost:8083/v1/missions/6
echo ""

echo "=== TEST 3: PUT /v1/missions/6 ==="
curl -s -X PUT -H "Content-Type: application/json" -d '{"status":"ACCEPTED"}' http://localhost:8083/v1/missions/6
echo ""

echo "=== TEST 4: GET /v1/missions/6 (verification) ==="
curl -s http://localhost:8083/v1/missions/6
echo ""

echo "=== Cleanup ==="
kill $SERVER_PID 2>/dev/null || true