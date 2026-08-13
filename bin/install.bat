@echo off

set "ROOT=%~dp0.."

reg add "HKCU\Software\Classes\.indo" /ve /d "IndoLanguageFile" /f

reg add "HKCU\Software\Classes\IndoLanguageFile\DefaultIcon" /ve /d "%ROOT%\logo.ico" /f

reg add "HKCU\Software\Classes\IndoLanguageFile\shell\open\command" /ve /d "node \"%ROOT%\index.js\" \"%%1\"" /f

echo Berhasil!
pause