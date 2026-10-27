@echo off
setlocal
title Nexus Vault - Servidor local
cd /d "%~dp0"
if errorlevel 1 goto :erro

echo.
echo  NEXUS VAULT - Seu cofre pessoal
echo  =============================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale o Node.js 24 LTS e tente novamente.
  goto :erro
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm nao encontrado. Reinstale o Node.js com a opcao npm habilitada.
  goto :erro
)
node -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major>20 || major===20 && minor>=9 ? 0 : 1)"
if errorlevel 1 (
  echo Versao do Node.js incompativel. Instale o Node.js 24 LTS.
  goto :erro
)

if not exist "node_modules\next\package.json" (
  echo Instalando dependencias. Aguarde...
  call npm ci
  if errorlevel 1 goto :erro
)

if not exist ".env.local" (
  copy /-Y ".env.example" ".env.local" >nul
  if errorlevel 1 goto :erro
  echo Arquivo .env.local criado a partir do exemplo.
  echo Preencha as tres variaveis conforme o README e execute este arquivo novamente.
  pause
  exit /b 0
)

echo Abra no navegador: http://localhost:3000
echo Mantenha esta janela aberta. Para parar, pressione Ctrl+C.
echo Se a porta 3000 estiver ocupada, encerre o servidor anterior e tente novamente.
echo.
call npm run dev -- --hostname localhost --port 3000
if errorlevel 1 goto :erro
exit /b 0

:erro
echo.
echo Nao foi possivel iniciar o servidor. Confira a mensagem acima.
pause
exit /b 1
