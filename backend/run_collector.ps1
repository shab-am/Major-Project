$env:PYTHONPATH = "$PSScriptRoot\venv\Lib\site-packages;$PSScriptRoot\config"
Set-Location $PSScriptRoot
python scripts\data_collector.py
