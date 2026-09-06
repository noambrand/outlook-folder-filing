@echo off
set MBX=them@company.com
title Sign out of Outlook and sign in again
echo.
echo   Signing out of whatever account is connected now.
echo   Nothing in any mailbox is changed by this.
echo.
call npx -y @softeria/ms-365-mcp-server --preset mail --org-mode --allowed-scopes "Mail.ReadWrite MailboxSettings.Read MailboxSettings.ReadWrite User.Read" --logout
echo.
echo   Now sign in AS %MBX%.
echo.
call npx -y @softeria/ms-365-mcp-server --preset mail --org-mode --allowed-scopes "Mail.ReadWrite MailboxSettings.Read MailboxSettings.ReadWrite User.Read" --expected-username %MBX% --login
echo.
pause
