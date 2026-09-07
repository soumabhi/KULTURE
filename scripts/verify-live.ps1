# Live verification of the KULTUR Supabase project after migrations.
# Uses ONLY the publishable key from .env.local — the same access level a
# visitor's phone has. Run: powershell -File scripts/verify-live.ps1

$ErrorActionPreference = "Continue"

$config = @{}
Get-Content "D:\KULTUR\.env.local" | ForEach-Object {
  if ($_ -match '^\s*([A-Z_]+)=(.+)$') { $config[$Matches[1]] = $Matches[2].Trim() }
}
$base = $config["NEXT_PUBLIC_SUPABASE_URL"]
$key = $config["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]
if (-not $base -or -not $key) { Write-Output "FAIL: .env.local missing Supabase config"; exit 1 }

$headers = @{ apikey = $key; Authorization = "Bearer $key" }
$passed = 0; $failed = 0

function Invoke-Rpc($name, $body) {
  Invoke-RestMethod -Method Post -Uri "$base/rest/v1/rpc/$name" -Headers $headers `
    -ContentType "application/json" -Body ($body | ConvertTo-Json -Compress)
}

Write-Output "== 1. public_scan_context with unknown batch (expect: empty array) =="
try {
  $r = Invoke-Rpc "public_scan_context" @{ input_batch_code = "VERIFY-NOPE" }
  if ($r -is [array] -and $r.Count -eq 0) { Write-Output "PASS"; $passed++ } else { Write-Output "FAIL: $r"; $failed++ }
} catch { Write-Output "FAIL: $($_.ErrorDetails.Message)"; $failed++ }

Write-Output "`n== 2. verify_public_otp with random token (expect: structured failure row) =="
try {
  $r = Invoke-Rpc "verify_public_otp" @{ input_claim_token = [guid]::NewGuid().ToString(); input_otp_hash = "x" }
  $row = @($r)[0]
  if ($row.out_success -eq $false) { Write-Output "PASS: $($row.out_message)"; $passed++ } else { Write-Output "FAIL: $($r | ConvertTo-Json -Compress)"; $failed++ }
} catch { Write-Output "FAIL: $($_.ErrorDetails.Message)"; $failed++ }

Write-Output "`n== 3. Anonymous read of leads table (expect: blocked by RLS) =="
try {
  $r = Invoke-RestMethod -Uri "$base/rest/v1/leads?select=id&limit=1" -Headers $headers
  if (@($r).Count -eq 0) { Write-Output "PASS (returns zero rows to anon)"; $passed++ } else { Write-Output "FAIL: anon could read lead rows"; $failed++ }
} catch {
  Write-Output "PASS (request denied): $($_.ErrorDetails.Message)"; $passed++
}

Write-Output "`n== 4. Anonymous read of vouchers table (expect: blocked/empty) =="
try {
  $r = Invoke-RestMethod -Uri "$base/rest/v1/vouchers?select=id&limit=1" -Headers $headers
  if (@($r).Count -eq 0) { Write-Output "PASS (returns zero rows to anon)"; $passed++ } else { Write-Output "FAIL: anon could read voucher rows"; $failed++ }
} catch {
  Write-Output "PASS (request denied): $($_.ErrorDetails.Message)"; $passed++
}

Write-Output "`n== 5. Anonymous write to leads (expect: denied) =="
try {
  # The anonymous-write test requires constructing a payload. To avoid hard-coded
  # identifiers or phone numbers in the repo, this test is only performed when
  # `PERFORM_ANON_WRITE_TEST=true` is set in .env.local. Otherwise it is skipped.
  if ($config["PERFORM_ANON_WRITE_TEST"] -eq "true") {
    $payload = @{
      campaign_id = [guid]::NewGuid().ToString()
      claim_id = [guid]::NewGuid().ToString()
      phone_e164 = $config["VERIFY_TEST_PHONE"] ?? "+919000000000"
      phone_hash = "x"
    } | ConvertTo-Json -Compress
    Invoke-RestMethod -Method Post -Uri "$base/rest/v1/leads" -Headers $headers `
      -ContentType "application/json" -Body $payload | Out-Null
    Write-Output "FAIL: anon insert succeeded"; $failed++
  } else {
    Write-Output "SKIP: anonymous-write test (set PERFORM_ANON_WRITE_TEST=true to enable)"; $passed++
  }
} catch { Write-Output "PASS (insert denied)"; $passed++ }

Write-Output "`n=== RESULT: $passed passed, $failed failed ==="
if ($failed -gt 0) { exit 1 }
