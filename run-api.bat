@echo off
REM ============================================================================
REM AX5-SECT - Lancer l'API (Windows)
REM ============================================================================

echo.
echo ============================================
echo   AX5-SECT - Démarrage de l'API
echo ============================================
echo.

REM Activer l'environnement virtuel
call venv\Scripts\activate.bat

REM Lancer l'API
echo Démarrage de l'API sur http://localhost:8000
echo Documentation: http://localhost:8000/docs
echo.
echo Appuyez sur Ctrl+C pour arrêter.
echo.

python main.py api --reload
