@echo off
title Путь - Запуск проекта
color 0A

echo =============================================
echo      ПУТЬ - ЗАПУСК РОАДМАП РЕЛИЗОВ
echo =============================================
echo.

:: Проверка установки Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не найден!
    echo.
    echo Скачайте и установите Node.js с сайта:
    echo https://nodejs.org/
    echo.
    echo После установки запустите этот файл снова.
    pause
    exit
)

:: Переход в папку бэкенда и установка зависимостей
echo [1/3] Настройка бэкенда...
cd backend
call npm install

:: Переход в папку фронтенда и установка зависимостей
echo.
echo [2/3] Настройка фронтенда...
cd ..\frontend
call npm install

:: Возврат в корневую папку
cd ..

:: Запуск серверов
echo.
echo [3/3] Запуск серверов...
echo.

start cmd /k "cd backend && title Путь-Бэкенд && echo Бэкенд запущен на http://localhost:3001 && npm run dev"
timeout /t 3 /nobreak >nul
start cmd /k "cd frontend && title Путь-Фронтенд && echo Фронтенд запущен на http://localhost:5173 && npm run dev"

echo.
echo =============================================
echo      ПРОЕКТ УСПЕШНО ЗАПУЩЕН!
echo =============================================
echo.
echo Бэкенд:  http://localhost:3001
echo Фронтенд: http://localhost:5173
echo.
echo Дождитесь запуска серверов в новых окнах.
echo.
pause
