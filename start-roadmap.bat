@echo off
chcp 65001 >nul
title 🚀 Путь - Роадмап релизов
color 0A

echo.
echo   ╔═══════════════════════════════════════════════════════╗
echo   ║                                                       ║
echo   ║      ⚡ ПУТЬ - ЗАПУСК РОАДМАП РЕЛИЗОВ 2026 ⚡          ║
echo   ║                                                       ║
echo   ╚═══════════════════════════════════════════════════════╝
echo.

:: Проверяем наличие node_modules
if not exist "backend\node_modules" (
    echo 📦 Установка зависимостей бэкенда...
    cd backend
    call npm install
    cd ..
) else (
    echo ✅ Бэкенд: зависимости уже установлены
)

if not exist "frontend\node_modules" (
    echo 📦 Установка зависимостей фронтенда...
    cd frontend
    call npm install
    cd ..
) else (
    echo ✅ Фронтенд: зависимости уже установлены
)

echo.

:: Запускаем бэкенд в новом окне
echo 🚀 Запуск бэкенд сервера...
start "Путь - Бэкенд" cmd /k "cd backend && title Путь - Бэкенд && echo Запуск бэкенда... && npm run dev"

:: Небольшая пауза чтобы бэкенд успел стартануть
timeout /t 3 /nobreak >nul

:: Запускаем фронтенд в новом окне
echo 🌐 Запуск фронтенд сервера...
start "Путь - Фронтенд" cmd /k "cd frontend && title Путь - Фронтенд && echo Запуск фронтенда... && npm run dev"

echo.
echo   ╔═══════════════════════════════════════════════════════╗
echo   ║                                                       ║
echo   ║   ✅ СЕРВЕРЫ УСПЕШНО ЗАПУЩЕНЫ!                        ║
echo   ║                                                       ║
echo   ║   📁 Бэкенд: http://localhost:3001                    ║
echo   ║   🌐 Фронтенд: http://localhost:5173                  ║
echo   ║                                                       ║
echo   ║   ❌ Закрой окна терминалов чтобы остановить          ║
echo   ║                                                       ║
echo   ╚═══════════════════════════════════════════════════════╝
echo.

pause