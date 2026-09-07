<#
PowerShell wrapper to run scripts/bootstrap-master-admin.mjs securely on Windows.

Usage (PowerShell):
  .\scripts\bootstrap-master-admin.ps1 -UserId <USER_ID>

If `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are not set in environment,
the script will prompt for them. The service role key prompt hides input.

Security: run this in a trusted, local environment. Do not commit service keys.
#>

param(
  [string]$UserId,
  [string]$OrgSlug = "kultur",
  [string]$OrgName = "Kultur"
)

function Read-ServiceRoleKey {
  Write-Host "Enter SUPABASE_SERVICE_ROLE_KEY (input hidden):" -ForegroundColor Yellow
  $secure = Read-Host -AsSecureString
  if (-not $secure) { return $null }
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr) } finally { if ($ptr) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) } }
}

if (-not $UserId) {
  $UserId = Read-Host "Enter your Supabase user id (copy from /app after signing in)"
}

if (-not $UserId) {
  Write-Error "User id is required. Aborting."; exit 2
}

if ($env:SUPABASE_URL) { $SUPABASE_URL = $env:SUPABASE_URL } else {
  $SUPABASE_URL = Read-Host "SUPABASE_URL (e.g. https://xyz.supabase.co)"
}

if ($env:SUPABASE_SERVICE_ROLE_KEY) { $SUPABASE_SERVICE_ROLE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY } else {
  $SUPABASE_SERVICE_ROLE_KEY = Read-ServiceRoleKey
}

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_ROLE_KEY) {
  Write-Error "Both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."; exit 2
}

$env:SUPABASE_URL = $SUPABASE_URL
$env:SUPABASE_SERVICE_ROLE_KEY = $SUPABASE_SERVICE_ROLE_KEY

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js is not on PATH. Install Node.js and try again."; exit 3
}

$scriptPath = Join-Path $PSScriptRoot 'bootstrap-master-admin.mjs'
if (-not (Test-Path $scriptPath)) {
  Write-Error "Could not find $scriptPath"; exit 4
}

Write-Host "Running bootstrap script for user $UserId (org: $OrgSlug)..." -ForegroundColor Cyan
& node $scriptPath --user-id $UserId --org-slug $OrgSlug --org-name $OrgName
$exitCode = $LASTEXITCODE
if ($exitCode -eq 0) { Write-Host "Done." -ForegroundColor Green } else { Write-Error "Script exited with code $exitCode" }
exit $exitCode
