Write-Host "AX5-SECT Setup" -ForegroundColor Cyan
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
Write-Host "Setup termine! Editez .env avec votre ANTHROPIC_API_KEY" -ForegroundColor Green
