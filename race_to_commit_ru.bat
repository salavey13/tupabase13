@echo off
:: СУПЕР ЛЕНИВЫЙ СКРИПТ ДЛЯ СОРЕВНОВАНИЯ ПО КОМИТУ С ПОДДЕРЖКОЙ ПУЛЛ-РЕКВЕСТОВ И ПЕРВОГО СООБЩЕНИЯ КОМИТА

:: Конфигурационные переменные
set REPO_URL=https://github.com/salavey13/tupabase13
set GIT_INSTALLER_URL=https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.1/Git-2.42.0-64-bit.exe
set REPO_DIR=%USERPROFILE%\Documents\projects\tupabase13
set DEFAULT_AI_URL=https://bolt.new/~/bolt-nextjs-shadcn-pkcsgc

:: Приветственное сообщение
echo ============================================
echo 🏁 Добро пожаловать в Великое Соревнование по Коммитам! 🏁
echo ============================================
echo Ленивый режим ВКЛЮЧЕН: Давайте оставим свой след в истории программирования.

:: Проверка установки Git
echo 🔍 Проверка наличия Git...
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 🛠️ Git не установлен. Устанавливаем без вопросов...
    curl -L -o git_installer.exe %GIT_INSTALLER_URL%
    start /wait git_installer.exe /SILENT
    del git_installer.exe
    echo 🔄 Git установлен! Перезапускаем скрипт...
    start "" "%~f0"
    exit /b
)

:: Проверка наличия папки проекта
if not exist "%REPO_DIR%" (
    echo 🛠️ Проект не найден локально. Клонируем репозиторий...
    git clone %REPO_URL% "%REPO_DIR%"
    echo ✅ Репозиторий клонирован. Продолжаем!
) else (
    echo Репозиторий найден! Пропускаем клонирование.
)

cd "%REPO_DIR%"

:: Проверка состояния первого коммита
if not exist "lib" (
    set RACE_WINNER=1
) else (
    set RACE_WINNER=0
)

:: Обнаружение существующего файла VERSION
if exist "VERSION" (
    for /f "tokens=1" %%v in ('type VERSION') do set CURRENT_VERSION=%%v
    echo Текущая версия проекта: %CURRENT_VERSION%
) else (
    set CURRENT_VERSION=0
    echo 0 > VERSION
)

:: Поиск ZIP файлов
echo 🔍 Поиск ZIP файлов...
setlocal enabledelayedexpansion
set ZIP_COUNT=0
set LATEST_ZIP=
set ZIP_FILES=

for %%f in ("%REPO_DIR%\*.zip") do (
    set /a ZIP_COUNT+=1
    set LATEST_ZIP=%%~nxf
    set ZIP_FILES=!ZIP_FILES! %%~nxf
)

:: Проверка наличия ZIP файлов или их одиночности
if %ZIP_COUNT% equ 1 (
    if %RACE_WINNER% equ 0 (
        echo ⚠️ Найден только один ZIP, и он уже применен.
        echo 🔄 ПОМЕСТИТЕ НОВЫЙ ZIP ВОТ ТУТ: "%REPO_DIR%"
        echo 🔄 Затем перезапустите этот скрипт.
        pause
        explorer "%REPO_DIR%"
        exit /b
    )
) else if %ZIP_COUNT% gtr 1 (
    echo Обнаружено несколько ZIP файлов. Выберите один для применения:
    set /a i=1
    for %%f in (%ZIP_FILES%) do (
        echo [!i!] %%~f
        set "ZIP_!i!=%%~f"
        set /a i+=1
    )
    set /p ZIP_CHOICE="Введите номер ZIP файла для использования (по умолчанию: последний): "
    if not defined ZIP_CHOICE set ZIP_CHOICE=%ZIP_COUNT%
    for /f "tokens=%ZIP_CHOICE%" %%f in ("%ZIP_FILES%") do set LATEST_ZIP=%%f
)

:: Проверка файла VERSION на уже примененные ZIP
findstr /c:"%LATEST_ZIP%" VERSION >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo 🔄 Архив "%LATEST_ZIP%" уже применен. Пожалуйста, добавьте новый ZIP.
    pause
    exit /b
)

:: Извлечение ZIP файла
echo 🛠️ Применение изменений из "%LATEST_ZIP%"...
powershell -Command "Expand-Archive -Force '%REPO_DIR%\%LATEST_ZIP%' -DestinationPath .\temp_unzip"
for /d %%d in (temp_unzip\*) do set ROOT_UNPACKED_DIR=%%d
xcopy /s /y "!ROOT_UNPACKED_DIR!\*" "%REPO_DIR%"
rmdir /s /q temp_unzip

:: Обновление файла VERSION
set /a NEXT_VERSION=%CURRENT_VERSION%+1
echo %NEXT_VERSION% %LATEST_ZIP% %DEFAULT_AI_URL% >> VERSION

:: Использование URL ИИ для первого коммита
if %RACE_WINNER% equ 1 (
    echo ============================================
    echo 🎉 Вы ПОБЕДИТЕЛЬ в Соревновании! Вечная слава вам! 🎉
    echo ============================================
    echo Пожалуйста, напишите легендарное сообщение для первого коммита:
    set /p COMMIT_MSG="Ваше сообщение для первого коммита: "
) else (
    set COMMIT_MSG="💥 Применены обновления из %LATEST_ZIP% | Версия %NEXT_VERSION% | ИИ инструмент: %DEFAULT_AI_URL%"
    echo ✅ Вы успешно внесли свой вклад. Отличная работа!
)

:: Создание новой ветки и коммит
set BRANCH_NAME=contributor_%DATE:~-4%%DATE:~-7,2%%DATE:~-10,2%_%TIME:~0,2%%TIME:~3,2%
git checkout -b %BRANCH_NAME%
git add .
git commit -m "%COMMIT_MSG%"

:: Отправка изменений и возврат на main
git push origin %BRANCH_NAME%
git checkout main
git pull origin main

:: Открытие страницы Pull Request в браузере
echo Открытие страницы Pull Request на GitHub в вашем браузере...
start "" "https://github.com/salavey13/tupabase13/pulls"

:: Завершающее сообщение
echo ============================================
echo ✅ Всё готово! Ваши изменения в новой ветке.
echo 🌟 Не забудьте создать Pull Request! 🌟
echo ============================================
echo 1. Перейдите на открытую страницу Pull Request на GitHub.
echo 2. Нажмите "New Pull Request".
echo 3. Выберите вашу ветку (%BRANCH_NAME%) и создайте PR.
pause
