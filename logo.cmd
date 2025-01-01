@echo off
setlocal enabledelayedexpansion


:: Original race script content starts here
mode con: cols=120 lines=30
title Animated ASCII Logo & Commit Race - oneSitePls
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
set "FIRE[0]= | ^)^( ^)^( || | | ^)^( | |"
set "FIRE[1]= | ^)^(  ^)^(  ^(^) | ^(^) | |"
set "FIRE[2]= | |_ |_ |  ^(^)  |_ ^(^)"
set "FIRE[3]= | || |_ | ^)^( ^)^( |_ ^(^)"
set "FIRE[4]= |_ ^(^) |_ ^(^) || || |_ "

:: Border Style
set "TOP_BORDER=
њњњњњњњњњњњњњњњњњњњњњњњњњњњьњњњњњ
 њњњњњњњњњњњњњњњњњњњњњњњьњњњњњњњњњњњњњњњњњэњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњ
 њњњњњњњњњњњњњњњњњњњјњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњэњњњњњњњњњњњњњњ
 њњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњјњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњњ
 
 
  ББВВлллллллллллллл 13 SALAVEY 13 SALAVEY 13 SALAVEY 13  ллллллллллллВВББ
 АББВВллл                                                            лллВВББА
ААББВВлл   RACE 25' - First Release          From: oneSitePls Corp.   ллВВББАА
ААББВВлл   Supplier : The Koler              Date : 12/22/2024        ллВВББАА
ААББВВлл   Protection : None                    Cracker : Nope        ллВВББАА
 АББВВллл                                                            лллВВББА
  ББВВлллллллллллллл 13 SALAVEY 13 SALAVEY 13 SALAVEY 13 ллллллллллллВВББ
 
 
 лллВВВВВБББББАААААААААА   PRODUCT DESCRIPTION :   АААААААААААБББББВВВВВлллл
ллл                                                                        ллл
"
set "BOTTOM_BORDER=
ллл                                                                         ллл
 лллВВВВВБББББААААААААААААААААААААААААААААААААААААААААААААААААААААААБББББВВВВВллл
 
 
  лллВВВВВБББББААААААААА _-_- SALAVEY13'S BOARDS : -_-_ АААААААААБВБВБВБВБВллл
 ллллВБВБВБВБВБВВВВВВВВ                                 ВВВВВВВВББВББВВБВВлллл
 ллллВВБВВББВББВВВВВВ -= X-Files =-         WORLD HQ .  ВВВВВВВБВБВБВБВБВлллл
 ллллВБВБВБВБВБВВВВВ -= Looking For =-      CANADA HQ .  ВВВВВВББВББВВБВВлллл
 ллллВВБВВББВББВВВВ -= Looking For =-       USA HQ .      ВВВВВБВБВБВБВБВлллл
 ллллВБВБВБВБВБВВВВ -= Looking For =-       GERMANY HQ    ВВВВВББВББВВБВВлллл
 ллллВВБВВББВББВВВВ -= Looking For =-       USA HQ        ВВВВВБВБВБВБВБВлллл
 ллллВБВБВБВБВБВВВВ Lucretia ^(972-3^)        ISRAEL HQ     ВВВВВББВББВВБВВлллл
 ллллВВБВВББВББВВВВ Psychotron ^(972-3^)      Member Board  ВВВВВБВБВБВБВБВлллл
 ллллВБВБВБВБВБВВВВ Info. SuperHighway      Member Board  ВВВВВББВББВВБВВлллл
 ллллВВБВВББВББВВВВ Beyond The Limit       Site ^(ISR^)   ВВВВВВБВБВБВБВБВлллл
 ллллВБВБВБВБВБВВВВ -= Looking For =-     Site ^(ISR^)  ВВВВВВВББВББВВБВВлллл
 ллллВВБВВББВББВВВВВВ                                 ВВВВВВВВБВБВБВБВБВлллл
  лллВВВВВБББББААААААААА -ГФГ-Г-Г-ГSALAVEY13!Г-Г-Г-ГФГ- АААААААААБББББВВВВВллл
 
 
 лллВВВВВБББББАААААААААААААА  MASSAGES FOR USERS :  АААААААААААБББББВВВВВллл
ллл                                                                        ллл
лл   Hello all !                                                             лл
лл   Currectly we r looking for member's boards and sites for our group !    лл
лл   If your intresting of being site or member board U need atlist :        лл
лл   BBS with 24hour line , one or more lines , over 500mb HDD online !      лл
лл   U need to be a nice sysop and with normal users ^(U know what i mean^) !  лл
лл   And if answer for all those rules ,Leave a massage to one of our active лл
лл   Member ^(Tracker site ,The koler ,The Nut Case Or CyberDeath . Enjoy !   лл
ллл                                                                        ллл
 лллВВВВВБББББААААААААААААААААААААААААААААААААААААААААААААААААААБББББВВВВВллл
 
 
БпппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппБ
В                                                                             В
л -=*^([Use the Software and Enjoy how much u want! We Really Don't Care!]^)*=- л
л                                                                             л
x -=*^([If you like the Software ,Please support the company and buy it !]^)*=- x
л                                                                             л
л -=*^([-=SALAVEY13=-    RULES    -=SALAVEY13=-    RULES    -=SALAVEY13=-]^)*=- л
В                                                                             В
БмммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммммБ
"
set "SIDE_BORDER=њ"

:: Main Loop
:mainloop
::cls

:: Display the top border
echo %TOP_BORDER%

:: Generate random fire lines
for /L %%i in (1,1,5) do (
    set /A RAND=!random! %% 5
    set "LINE=!FIRE[!RAND!]!"
    set "COLORED_LINE="
    for %%j in (!LINE!) do (
        set /A "RAND_COLOR=!random! %% 5"
        set "COLORED_LINE=!COLORED_LINE!%FIRE_COLORS:%%RAND_COLOR%%"
    )
    echo !COLORED_LINE!
)

:: Display static ASCII
echo %FIXED_TEXT%

:: Display the bottom border
echo %BOTTOM_BORDER%
timeout /t 1 >nul
goto mainloop