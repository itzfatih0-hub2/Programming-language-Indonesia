@echo off

reg add "HKCU\Software\Classes\.indo" /ve /d "IndoLanguageFile" /f

reg add "HKCU\Software\Classes\IndoLanguageFile\DefaultIcon" /ve /d "%~dp0logo.ico" /f

reg add "HKCU\Software\Classes\IndoLanguageFile\shell\open\command" /ve /d "node \"%~dp0index.js\" \"%%1\"" /f

echo Berhasil!
pause