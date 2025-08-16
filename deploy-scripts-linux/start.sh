#!/bin/bash

echo "=============================================="
echo "     MDD 시스템 시작 스크립트"
echo "=============================================="
echo

# Check if API is already running
if pgrep -f "node.*dist/main" > /dev/null; then
    echo "이미 실행 중인 API 서버가 있습니다."
    echo "기존 프로세스를 종료하고 다시 시작하시겠습니까? (y/N)"
    read -r choice
    if [[ "$choice" =~ ^[Yy]$ ]]; then
        pkill -f "node.*dist/main"
        sleep 2
    fi
fi

echo "1. API 서버 시작 중..."
cd api
nohup npm run start:prod > ../logs/api.log 2>&1 &
API_PID=$!
echo "API Server PID: $API_PID"
cd ..

sleep 3

echo
echo "2. 웹 서버 시작 중 (Admin Portal)..."
cd admin-portal
nohup python3 -m http.server 3000 --directory dist > ../logs/web.log 2>&1 &
WEB_PID=$!
echo "Web Server PID: $WEB_PID"
cd ..

echo
echo "3. PID 파일 저장 중..."
echo $API_PID > api.pid
echo $WEB_PID > web.pid

echo
echo "=============================================="
echo "     MDD 시스템이 시작되었습니다!"
echo "=============================================="
echo
echo "서비스 접속:"
echo "- Admin Portal: http://localhost:3000"
echo "- API Server: http://localhost:4000"
echo
echo "로그 확인:"
echo "- API: tail -f logs/api.log"
echo "- Web: tail -f logs/web.log"
echo
echo "서비스 종료:"
echo "- ./stop.sh를 실행하세요"
echo

# Try to open browser (if available)
if command -v xdg-open > /dev/null; then
    echo "브라우저에서 Admin Portal 열기..."
    sleep 2
    xdg-open http://localhost:3000 2>/dev/null &
elif command -v open > /dev/null; then
    sleep 2
    open http://localhost:3000 2>/dev/null &
fi