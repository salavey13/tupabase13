@echo off
setlocal enabledelayedexpansion

:: Console settings
mode con: cols=80 lines=30
title ASCII Fire Animation - oneSitePls

:: Colors
set COLORS=4C 4E 4F 4D 4B 4A 4E

:: ASCII Art
set "FIXED_TEXT=
                ^(               ^(          
                ^)^\ ^)      ^)     ^)^\ ^) ^(     
             ^( ^(^(^)^/^(^(  ^( ^/^(  ^( ^(^(^)^/^( ^)^\    
  ^(   ^(     ^)^)^\ ^/^(_^)^)^\ ^)^\^(^)^)^)^)^\ ^/^(_^)|^(_|   
  ^)^\  ^)^\ ^) ^/^(^(_|_^)^)^(^(_|_^)^)^/^/^(^(_|_^)^)  _ ^)^\  
 ^(^(_^)_^(_^/^(^(_^)^) ^/ __|^(_^) |_^(_^)^) | _ ^\| ^(^(_^) 
^/ _ ^\ ' ^\^)^) -_^)^\__ ^\| |  _^/ -_^)|  _^/| ^(_-< 
^\___^/_||_|^\___||___^/|_|^\__^\___||_|  |_^/__^/ 
                                           
"

:mainloop
cls

:: Generate fire effect
for /L %%i in (1,1,8) do (
    set "LINE="
    for /L %%j in (1,1,80) do (
        set /A "RAND=!random! %% 7"
        for %%k in (!RAND!) do (
            set "LINE=!LINE!%COLORS:~%%k,1%█"
        )
    )
    echo !LINE!
)

:: Print static text
echo(
for %%A in (!FIXED_TEXT!) do echo %%A

:: Pause for animation
timeout /nobreak /t 1 >nul

:: Loop indefinitely
goto mainloop
