@echo off
title Put Roadmap Installer
color 0A

echo ===================================
echo   УСТАНОВКА И ЗАПУСК ПРОЕКТА
echo ===================================
echo.

:: Проверка Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не найден!
    echo Скачай с https://nodejs.org/
    pause
    exit
)

:: Бэкенд
echo [1/3] Установка бэкенда...
cd backend
call npm install

:: Фронтенд
echo [2/3] Установка фронтенда...
cd ../frontend
call npm install

cd ..

:: Запуск
echo [3/3] Запуск серверов...
echo.

start cmd /k "cd backend && npm run dev"
timeout /t 3
start cmd /k "cd frontend && npm run dev"

echo.
echo ===================================
echo   ПРОЕКТ ЗАПУЩЕН!
echo ===================================
echo.
echo Бэкенд:  http://localhost:3001
echo Фронтенд: http://localhost:5173
echo.
pause
