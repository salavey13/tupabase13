@echo off
setlocal enabledelayedexpansion

:: Console settings for fullscreen and larger display
mode con: cols=120 lines=30
title Animated ASCII Logo - oneSitePls
cls

:: Define Colors
set FIRE_COLORS=4E 4F 4C 4D 4B
set FIXED_COLORS=1F 9F 3F 7F

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

:: Fire Variations
set "FIRE[0]= | )( )( || | | )( | |"
set "FIRE[1]= | )(  )(  () | () | |"
set "FIRE[2]= | |_ |_ |  ()  |_ ()"
set "FIRE[3]= | || |_ | )( )( |_ ()"
set "FIRE[4]= |_ () |_ () || || |_ "

:: Border Style
set "TOP_BORDER=╔════════════════════════════════════════════════════════════════════════════════════╗"
set "BOTTOM_BORDER=╚════════════════════════════════════════════════════════════════════════════════╝"
set "SIDE_BORDER=║"

:: Main Loop
:mainloop
cls

:: Display the top border
echo %TOP_BORDER%

:: Generate random fire lines
for /L %%i in (1,1,5) do (
    set /A RAND=!random! %% 5
    set "LINE=!FIRE[!RAND!]!"
    set "COLORED_LINE="
    for %%j in (!LINE!) do (
        set /A "RAND_COLOR=!random! %% 5"
        set "COLORED_LINE=!COLORED_LINE!%FIRE_COLORS:~!RAND_COLOR!,2%!~%%j"
    )
    echo %SIDE_BORDER%!COLORED_LINE:~0,118%!%SIDE_BORDER%
)

:: Display the fixed logo
for %%A in (%FIXED_TEXT%) do (
    echo %SIDE_BORDER%!FIXED_TEXT:~0,118%!%SIDE_BORDER%
)

:: Display the bottom border
echo %BOTTOM_BORDER%

:: Pause briefly
timeout /nobreak /t 1 >nul

:: Repeat the animation loop
goto mainloop
