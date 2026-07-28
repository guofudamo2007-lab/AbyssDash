[CmdletBinding()]
param(
    [string]$Repository = 'guofudamo2007-lab/AbyssDash',
    [string]$Branch = 'main'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-PlainTextToken {
    param([System.Security.SecureString]$SecureToken)

    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureToken)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

function Get-RemoteFile {
    param(
        [hashtable]$Headers,
        [string]$Repository,
        [string]$Path,
        [string]$Branch
    )

    $escapedPath = ($Path -split '/' | ForEach-Object { [uri]::EscapeDataString($_) }) -join '/'
    $uri = "https://api.github.com/repos/$Repository/contents/$escapedPath`?ref=$([uri]::EscapeDataString($Branch))"
    try {
        return Invoke-RestMethod -Method Get -Uri $uri -Headers $Headers
    }
    catch {
        if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 404) {
            return $null
        }
        throw
    }
}

function Publish-File {
    param(
        [hashtable]$Headers,
        [string]$Repository,
        [string]$Branch,
        [string]$Path,
        [string]$CommitMessage
    )

    $localPath = Join-Path $PSScriptRoot $Path
    if (-not (Test-Path -LiteralPath $localPath -PathType Leaf)) {
        throw "找不到本地文件：$localPath"
    }

    $remote = Get-RemoteFile -Headers $Headers -Repository $Repository -Path $Path -Branch $Branch
    $rawBytes = [System.IO.File]::ReadAllBytes($localPath)
    $request = [ordered]@{
        message = $CommitMessage
        content = [Convert]::ToBase64String($rawBytes)
        branch  = $Branch
    }
    if ($null -ne $remote) {
        $request.sha = $remote.sha
    }

    $escapedPath = ($Path -split '/' | ForEach-Object { [uri]::EscapeDataString($_) }) -join '/'
    $uri = "https://api.github.com/repos/$Repository/contents/$escapedPath"
    $body = $request | ConvertTo-Json -Depth 4 -Compress
    $result = Invoke-RestMethod -Method Put -Uri $uri -Headers $Headers -ContentType 'application/json' -Body $body
    Write-Host "已提交：$Path  ($($result.commit.sha.Substring(0, 7)))" -ForegroundColor Green
}

$secureToken = Read-Host 'Paste GitHub token and press Enter (input is hidden)' -AsSecureString
$token = Get-PlainTextToken -SecureToken $secureToken

try {
    $headers = @{
        Accept                 = 'application/vnd.github+json'
        Authorization          = "Bearer $token"
        'X-GitHub-Api-Version' = '2026-03-10'
    }

    Publish-File -Headers $headers -Repository $Repository -Branch $Branch -Path 'assets/art/characters/shark-default-spritesheet.png' -CommitMessage 'release: v9.7.0 default shark sprite'
    Publish-File -Headers $headers -Repository $Repository -Branch $Branch -Path 'assets/art/characters/shark-cyber-spritesheet.png' -CommitMessage 'release: v9.7.0 cyber shark sprite'
    Publish-File -Headers $headers -Repository $Repository -Branch $Branch -Path 'assets/art/bosses/boss-octopus-spritesheet.png' -CommitMessage 'release: v9.7.0 octopus boss sprite'
    Publish-File -Headers $headers -Repository $Repository -Branch $Branch -Path 'assets/art/bosses/boss-submarine-spritesheet.png' -CommitMessage 'release: v9.7.0 submarine boss sprite'
    Publish-File -Headers $headers -Repository $Repository -Branch $Branch -Path 'assets/audio/music/boss-battle-beneath-the-crush.mp3' -CommitMessage 'release: v9.7.0 boss battle music'
    Publish-File -Headers $headers -Repository $Repository -Branch $Branch -Path 'assets/README.md' -CommitMessage 'docs: document v9.7.0 asset structure'
    Publish-File -Headers $headers -Repository $Repository -Branch $Branch -Path 'README.md' -CommitMessage 'docs: publish v9.7.0 release notes'
    Publish-File -Headers $headers -Repository $Repository -Branch $Branch -Path 'index.html' -CommitMessage 'release: Abyss Dash v9.7.0'
    Write-Host 'All updates completed.' -ForegroundColor Green
}
finally {
    $token = $null
    $secureToken.Dispose()
}
