@echo off
chcp 65001 >nul
title Configurar Novo Dominio - Chud Vault
cls
echo ========================================================
echo       CONFIGURADOR AUTOMATICO DE NOVO DOMINIO
echo ========================================================
echo.
echo Digite o nome do seu novo dominio comprado (sem https:// nem www)
echo Exemplo: meunovodominio.com
echo.
set /p DOMINIO="Dominio: "

if "%DOMINIO%"=="" (
    echo.
    echo [ERRO] Nenhum dominio informado. Operacao cancelada.
    echo.
    pause
    exit /b
)

echo %DOMINIO%> CNAME
echo.
echo [1/3] Arquivo CNAME criado com sucesso contendo: %DOMINIO%
echo.

git status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Git nao detectado. O arquivo CNAME foi salvo na pasta.
    echo Faca o upload do arquivo CNAME pelo GitHub Desktop.
    echo.
    pause
    exit /b
)

echo [2/3] Registrando CNAME no Git...
git add CNAME
git commit -m "Configura novo dominio personalizado: %DOMINIO%"

echo.
echo [3/3] Enviando atualizacao para o GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Nao foi possivel dar push direto pelo terminal.
    echo Abra o GitHub Desktop e clique no botao "Push origin" no topo!
)

echo.
echo ========================================================
echo  TUDO PRONTO!
echo.
echo  O arquivo CNAME foi configurado.
echo  Agora configure o Cloudflare e a Namecheap conforme o
echo  arquivo INSTRUCOES_PUBLICACAO_E_DOMINIO.md
echo ========================================================
echo.
pause
