@echo off
set MBX=them@company.com
title Check the Outlook sign-in
echo.
echo   Checking whether %MBX% is connected...
echo.
call npx -y @softeria/ms-365-mcp-server --preset mail --org-mode --allowed-scopes "Mail.ReadWrite MailboxSettings.Read MailboxSettings.ReadWrite User.Read" --expected-username %MBX% --verify-login
echo.
pause
