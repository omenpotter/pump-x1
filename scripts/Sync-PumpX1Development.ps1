param(
    [Parameter(Mandatory = $true)][string]$Checkout,
    [string]$Source = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$sourceRoot = (Resolve-Path -LiteralPath $Source).Path
$checkoutRoot = (Resolve-Path -LiteralPath $Checkout).Path
if ($sourceRoot -eq $checkoutRoot) { throw 'Use a separate Git checkout.' }

function Invoke-PumpGit {
    git -C $checkoutRoot @args
    if ($LASTEXITCODE -ne 0) { throw "Git $($args -join ' ') failed." }
}

$actualRoot = Invoke-PumpGit rev-parse --show-toplevel
if ((Resolve-Path -LiteralPath $actualRoot).Path -ne $checkoutRoot) { throw 'Select the Git checkout root.' }
if ((Invoke-PumpGit branch --show-current) -ne 'codex/pumpx1-upgrade') { throw 'Switch to codex/pumpx1-upgrade first.' }
if (Invoke-PumpGit status --porcelain) { throw 'Use a clean checkout to avoid overwriting local changes.' }

$trees = @('app', 'components', 'lib', 'public', 'tests', 'scripts')
$files = @(
    'package.json', 'package-lock.json', 'next.config.js', 'tsconfig.json', 'vercel.json', 'eslint.config.mjs',
    'docs/upgrade/02_BRANDING_LOCK_MANIFEST.md',
    'docs/upgrade/evidence/x1-mint-finalized.json',
    'docs/upgrade/evidence/xdex-paired-quote.json',
    'docs/upgrade/evidence/x1-xdex-pool.json',
    'docs/upgrade/evidence/x1-xdex-pool-signatures.json',
    'docs/upgrade/evidence/x1-xdex-pool-transactions.json'
)

foreach ($path in $trees + $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot $path))) { throw "Missing release path $path." }
}

# Scope deletions to tracked paths in the release trees, including files renamed in the source checkout.
$tracked = @(Invoke-PumpGit -c core.quotePath=false ls-files -- @trees)
foreach ($path in $tracked) {
    if ($path.StartsWith('"') -or $path.Split('/') -contains '..') { throw "Unexpected Git path $path." }
    if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot $path) -PathType Leaf)) {
        Invoke-PumpGit rm --quiet -- $path
    }
}

# The migrated project uses ESLint flat config exclusively.
Invoke-PumpGit rm --quiet --ignore-unmatch -- '.eslintrc.json'

foreach ($path in $trees) {
    $target = Join-Path $checkoutRoot $path
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    Get-ChildItem -LiteralPath (Join-Path $sourceRoot $path) -Force |
        Where-Object { $_.Name -ne '__pycache__' } |
        Copy-Item -Destination $target -Recurse -Force
}
foreach ($path in $files) {
    $target = Join-Path $checkoutRoot $path
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $sourceRoot $path) -Destination $target -Force
}

Invoke-PumpGit add -A -- @trees @files
Invoke-PumpGit -c core.whitespace=cr-at-eol diff --cached --check
Invoke-PumpGit status --short
