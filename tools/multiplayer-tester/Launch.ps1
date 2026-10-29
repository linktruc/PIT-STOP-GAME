$ErrorActionPreference = 'Stop'
try {
    $testerNode = Join-Path $PSScriptRoot 'runtime\node.exe'
    if (-not (Test-Path -LiteralPath $testerNode)) {
        $testerNode = (Get-Command node.exe -ErrorAction Stop).Source
    }
    if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules\playwright-core'))) {
        throw 'Missing playwright-core. Extract the complete portable ZIP, or run npm install in the source folder.'
    }
    Start-Process -FilePath $testerNode -ArgumentList 'server.mjs' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden | Out-Null
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
