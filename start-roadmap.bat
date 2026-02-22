# Открой терминал в папке проекта
# Удали старый файл
del start-roadmap.bat

# Создай новый файл через echo (это гарантирует правильный формат)
echo @echo off > start-roadmap.bat
echo title Путь - Запуск проекта >> start-roadmap.bat
echo color 0A >> start-roadmap.bat
echo. >> start-roadmap.bat
echo echo ============================================= >> start-roadmap.bat
echo echo      ПУТЬ - ЗАПУСК РОАДМАП РЕЛИЗОВ >> start-roadmap.bat
echo echo ============================================= >> start-roadmap.bat
echo echo. >> start-roadmap.bat
echo :: Проверка Node.js >> start-roadmap.bat
echo where node ^>nul 2^>nul >> start-roadmap.bat
echo if %%errorlevel%% neq 0 ( >> start-roadmap.bat
echo     echo [ОШИБКА] Node.js не найден! >> start-roadmap.bat
echo     echo. >> start-roadmap.bat
echo     pause >> start-roadmap.bat
echo     exit >> start-roadmap.bat
echo ) >> start-roadmap.bat
echo. >> start-roadmap.bat
echo cd backend >> start-roadmap.bat
echo call npm install >> start-roadmap.bat
echo. >> start-roadmap.bat
echo cd ..\frontend >> start-roadmap.bat
echo call npm install >> start-roadmap.bat
echo. >> start-roadmap.bat
echo cd .. >> start-roadmap.bat
echo. >> start-roadmap.bat
echo start cmd /k "cd backend && title Путь-Бэкенд && echo Бэкенд запущен на http://localhost:3001 && npm run dev" >> start-roadmap.bat
echo timeout /t 3 /nobreak ^>nul >> start-roadmap.bat
echo start cmd /k "cd frontend && title Путь-Фронтенд && echo Фронтенд запущен на http://localhost:5173 && npm run dev" >> start-roadmap.bat
echo. >> start-roadmap.bat
echo echo ============================================= >> start-roadmap.bat
echo echo      ПРОЕКТ ЗАПУЩЕН! >> start-roadmap.bat
echo echo ============================================= >> start-roadmap.bat
echo echo. >> start-roadmap.bat
echo pause >> start-roadmap.bat

# Добавь в git
git add start-roadmap.bat
git commit -m "Add working batch file with Windows line endings"
git push
