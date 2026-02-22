@echo off
title Put - Roadmap Installer
color 0A

echo ===============================================
echo     PUT - УСТАНОВКА И ЗАПУСК ПРОЕКТА
echo ===============================================
echo.

:: Проверяем наличие Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не найден!
    echo.
    echo Установи Node.js с сайта: https://nodejs.org/
    echo.
    pause
    exit
) else (
    echo [OK] Node.js найден
)

:: Проверяем наличие npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] npm не найден!
    pause
    exit
) else (
    echo [OK] npm найден
)

echo.

:: =============================================
:: БЭКЕНД
:: =============================================
echo [1/3] Настройка бэкенда...
echo.

cd backend

if not exist "node_modules" (
    echo     Установка зависимостей бэкенда...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ОШИБКА] Не удалось установить зависимости бэкенда
        pause
        exit
    )
    echo     [OK] Зависимости бэкенда установлены
) else (
    echo     [OK] Зависимости бэкенда уже установлены
)

cd ..

echo.

:: =============================================
:: ФРОНТЕНД
:: =============================================
echo [2/3] Настройка фронтенда...
echo.

cd frontend

if not exist "node_modules" (
    echo     Установка зависимостей фронтенда...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ОШИБКА] Не удалось установить зависимости фронтенда
        pause
        exit
    )
    echo     [OK] Зависимости фронтенда установлены
) else (
    echo     [OK] Зависимости фронтенда уже установлены
)

cd ..

echo.
echo ===============================================
echo [3/3] ЗАПУСК СЕРВЕРОВ...
echo ===============================================
echo.

:: Запускаем бэкенд
echo Запуск бэкенда...
start "Put - Backend" cmd /k "cd backend && title Put - Backend && echo. && echo Бэкенд запущен на http://localhost:3001 && echo. && npm run dev"

:: Небольшая пауза
timeout /t 3 /nobreak >nul

:: Запускаем фронтенд
echo Запуск фронтенда...
start "Put - Frontend" cmd /k "cd frontend && title Put - Frontend && echo. && echo Фронтенд запущен на http://localhost:5173 && echo. && npm run dev"

echo.
echo ===============================================
echo     ПРОЕКТ УСПЕШНО ЗАПУЩЕН!
echo ===============================================
echo.
echo Бэкенд:  http://localhost:3001
echo Фронтенд: http://localhost:5173
echo.
echo Подожди несколько секунд для запуска серверов
echo.
echo Для остановки закрой все окна терминалов
echo.
pause
