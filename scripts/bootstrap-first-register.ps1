Param(
  [Parameter(Mandatory=$false)]
  [string]$Email,
  [Parameter(Mandatory=$false)]
  [string]$Password,
  [Parameter(Mandatory=$false)]
  [string]$UserId,
  [Parameter(Mandatory=$false)]
  [string]$OrgSlug = "kultur",
  [Parameter(Mandatory=$false)]
  [string]$OrgName = "Kultur"
)

# PowerShell wrapper for scripts/bootstrap-first-register.mjs
Write-Host "Running bootstrap-first-register with provided arguments..."

$args = @()
if ($Email) { $args += "--email"; $args += $Email }
if ($Password) { $args += "--password"; $args += $Password }
if ($UserId) { $args += "--user-id"; $args += $UserId }
if ($OrgSlug) { $args += "--org-slug"; $args += $OrgSlug }
if ($OrgName) { $args += "--org-name"; $args += $OrgName }

node ./scripts/bootstrap-first-register.mjs @args
