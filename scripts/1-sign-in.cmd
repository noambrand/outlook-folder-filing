@echo off
REM Replace them@company.com with the mailbox this should work on.
set MBX=them@company.com
title Sign in to Outlook as %MBX%
echo.
echo   Signing in to %MBX%
echo.
echo   A code and a web address will appear below in a moment.
echo   Open the address, type the code, and sign in AS %MBX%.
echo.
echo   Any other account will be refused, so nothing can be sorted
echo   in the wrong mailbox.
echo.
echo   The only permissions asked for are: read and write your own
echo   mail, read and write your own mailbox settings, and read your
echo   own name. There is NO permission to send mail.
echo.
call npx -y @softeria/ms-365-mcp-server --preset mail --org-mode --allowed-scopes "Mail.ReadWrite MailboxSettings.Read MailboxSettings.ReadWrite User.Read" --expected-username %MBX% --login
echo.
pause
