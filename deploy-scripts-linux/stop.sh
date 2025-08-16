#!/bin/bash

echo "=============================================="
echo "     MDD 시스템 종료 스크립트"
echo "=============================================="
echo

echo "1. API 서버 종료 중..."
if [ -f api.pid ]; then
    API_PID=$(cat api.pid)
    if kill -0 "$API_PID" 2>/dev/null; then
        kill "$API_PID"
        echo "API 서버 (PID: $API_PID)가 종료되었습니다."
    else
        echo "API 서버가 이미 종료되었습니다."
    fi
    rm -f api.pid
else
    # Fallback: kill by process name
    pkill -f "node.*dist/main"
    echo "실행 중인 API 서버를 모두 종료했습니다."
fi

echo
echo "2. 웹 서버 종료 중..."
if [ -f web.pid ]; then
    WEB_PID=$(cat web.pid)
    if kill -0 "$WEB_PID" 2>/dev/null; then
        kill "$WEB_PID"
        echo "웹 서버 (PID: $WEB_PID)가 종료되었습니다."
    else
        echo "웹 서버가 이미 종료되었습니다."
    fi
    rm -f web.pid
else
    # Fallback: kill python http server
    pkill -f "python.*http.server.*3000"
    echo "실행 중인 웹 서버를 모두 종료했습니다."
fi

echo
echo "3. Electron 프로세스 종료 중..."
pkill -f "electron" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Viewer 앱이 종료되었습니다."
else
    echo "실행 중인 Viewer 앱이 없습니다."
fi

echo
echo "=============================================="
echo "     MDD 시스템이 종료되었습니다."
echo "=============================================="