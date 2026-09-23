@echo off
title CHUD VAULT - Iniciar Servidor Local
echo ========================================================
echo   [CHUD VAULT // INDEXADOR RETRO DE DOWNLOADS]
echo   Iniciando servidor local em http://localhost:8080 ...
echo ========================================================
start http://localhost:8080
python -m http.server 8080
pause
