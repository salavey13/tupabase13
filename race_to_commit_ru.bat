@echo off
:: ЛЕНИВЫЙ СКРИПТ ДЛЯ ПУЛЛ РЕКВЕСТОВ С ВАШИМ AI
:: ВЕРСИЯ ДЛЯ РУССКОЙ ЛЕНИВОЙ КОМАНДЫ

:: Конфигурация
set REPO_URL=https://github.com/salavey13/tupabase13
set GIT_INSTALLER_URL=https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.1/Git-2.42.0-64-bit.exe
set REPO_DIR=%USERPROFILE%\Documents\projects\tupabase13
set DEFAULT_AI_URL=https://bolt.new/~/bolt-nextjs-shadcn-pkcsgc

:: Приветственное сообщение
echo ============================================
echo 🚀 Добро пожаловать в ЛЕНИВУЮ КОМАНДУ AI! 🚀
echo ============================================
echo Сегодня мы не работаем. Сегодня мы учим **БОТА** работать за нас!
echo Сядь поудобнее, наливай чай. Сейчас ты станешь крутым коммитером. 😎

:: Проверка на наличие Git
echo 🔍 Проверяем наличие Git...
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 🛠️ Git не установлен. Скачиваем и ставим за тебя!
    curl -L -o git_installer.exe %GIT_INSTALLER_URL%
    start /wait git_installer.exe /SILENT
    del git_installer.exe
    echo 🔄 Git установлен! Перезапускаем скрипт...
    start "" "%~f0"
    exit /b
)

:: Проверка папки проекта
if not exist "%REPO_DIR%" (
    echo 🛠️ Репозиторий не найден. Клонируем его...
    git clone %REPO_URL% "%REPO_DIR%"
    echo ✅ Репозиторий клонирован! Вперёд!
) else (
    echo Репозиторий уже на месте. Всё готово!
)

cd "%REPO_DIR%"

:: Проверка первого коммита
if not exist "lib" (
    set RACE_WINNER=1
) else (
    set RACE_WINNER=0
)

:: Проверка файла VERSION
if exist "VERSION" (
    for /f "tokens=1-3" %%v in ('type VERSION') do (
        set CURRENT_VERSION=%%v
        set LAST_APPLIED_ZIP=%%w
    )
    echo Текущая версия проекта: %CURRENT_VERSION%, последний ZIP: %LAST_APPLIED_ZIP%
) else (
    set CURRENT_VERSION=0
    set LAST_APPLIED_ZIP=
    echo 0 > VERSION
)

:: Поиск ZIP-архивов
echo 🔍 Ищем ZIP-архивы с твоим кодом...
setlocal enabledelayedexpansion
set ZIP_COUNT=0
set LATEST_ZIP=
set ZIP_FILES=

for %%f in ("%REPO_DIR%\*.zip") do (
    set /a ZIP_COUNT+=1
    set LATEST_ZIP=%%~nxf
    set ZIP_FILES=!ZIP_FILES! %%~nxf
)

:: Если нет ZIP или он только один
if %ZIP_COUNT% equ 1 (
    if %RACE_WINNER% equ 0 (
        echo ⚠️ Найден только один ZIP, и он уже был применён.
        echo 🔄 Положи НОВЫЙ ZIP сюда: "%REPO_DIR%"
        echo 🔄 И запусти скрипт снова.
        pause
        explorer "%REPO_DIR%"
        exit /b
    )
) else if %ZIP_COUNT% gtr 1 (
    echo Найдено несколько ZIP-файлов. Выбери нужный:
    set /a i=1
    for %%f in (%ZIP_FILES%) do (
        echo [!i!] %%~f
        set "ZIP_!i!=%%~f"
        set /a i+=1
    )
    set /p ZIP_CHOICE="Введи номер ZIP-файла (по умолчанию последний): "
    if not defined ZIP_CHOICE set ZIP_CHOICE=%ZIP_COUNT%
    for /f "tokens=%ZIP_CHOICE%" %%f in ("%ZIP_FILES%") do set LATEST_ZIP=%%f
)

:: Проверка изменений в уже применённом ZIP
findstr /c:"%LATEST_ZIP%" VERSION >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo 🔄 ZIP "%LATEST_ZIP%" уже применён. Проверяем на изменения...
    powershell -Command "Expand-Archive -Force '%REPO_DIR%\%LATEST_ZIP%' -DestinationPath .\temp_unzip"
    for /d %%d in (temp_unzip\*) do set ROOT_UNPACKED_DIR=%%d
    xcopy /s /y "!ROOT_UNPACKED_DIR!\*" "%REPO_DIR%\temp_git_check"
    rmdir /s /q temp_unzip

    git diff --quiet "%REPO_DIR%\temp_git_check" >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo 🔄 ZIP "%LATEST_ZIP%" без изменений. Ничего не делаем!
        rmdir /s /q "%REPO_DIR%\temp_git_check"
        pause
        exit /b
    ) else (
        echo ⚠️ ZIP "%LATEST_ZIP%" изменён. Применяем обновления.
    )
    rmdir /s /q "%REPO_DIR%\temp_git_check"
)

:: Применяем ZIP
echo 🛠️ Распаковываем "%LATEST_ZIP%"...
powershell -Command "Expand-Archive -Force '%REPO_DIR%\%LATEST_ZIP%' -DestinationPath .\temp_unzip"
for /d %%d in (temp_unzip\*) do set ROOT_UNPACKED_DIR=%%d
xcopy /s /y "!ROOT_UNPACKED_DIR!\*" "%REPO_DIR%"
rmdir /s /q temp_unzip

:: Обновление VERSION
set /a NEXT_VERSION=%CURRENT_VERSION%+1
set AI_TOOL_URL=https://bolt.new/~/%LATEST_ZIP:~0,-4%
echo %NEXT_VERSION% %LATEST_ZIP% %AI_TOOL_URL% >> VERSION

:: Используем URL AI по умолчанию для первого коммита
if %RACE_WINNER% equ 1 (
    echo ====================================================================
    echo 🏆 ТЫ ПОБЕДИТЕЛЬ ГОНКИ! 🏆 Бессмертная слава и уважение в команде за тобой!
    echo ====================================================================
    echo Напиши легендарное сообщение для первого коммита, чтобы твое имя осталось в истории:
    set /p COMMIT_MSG="Твой легендарный коммит: "
) else (
    set COMMIT_MSG="💥 Обновления от %LATEST_ZIP% | Версия %NEXT_VERSION% | Инструмент AI: %AI_TOOL_URL%"
    echo ✅ Ты успешно внес свой вклад! Отличная работа, двигайся дальше!
)

:: Создание новой ветки и коммита
set BRANCH_NAME=бот_%DATE:~-4%%DATE:~-7,2%%DATE:~-10,2%_%TIME:~0,2%%TIME:~3,2%
git checkout -b %BRANCH_NAME%
git add .
git commit -m "%COMMIT_MSG%"


:: Пуш изменений и возврат на main
git push origin %BRANCH_NAME%
git checkout main
git pull origin main

:: Открытие PR в браузере
echo Открываем страницу Pull Request в твоём браузере...
start "" "https://github.com/salavey13/tupabase13/pulls"

:: Завершение
echo ============================================
echo ✅ Всё готово! Твои изменения на новой ветке.
echo 🌟 Создай Pull Request, чтобы твой бот стал умнее! 🌟
pause
