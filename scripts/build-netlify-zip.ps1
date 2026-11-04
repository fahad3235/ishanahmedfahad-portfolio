param(
    [string]$DistPath = "dist",
    [string]$ZipPath = "netlify-deploy.zip"
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $ZipPath) {
    Remove-Item -Path $ZipPath -Force
}

# Remove netlify.toml from dist if present (Drop deployments are pre-built static assets and must NOT contain build commands)
if (Test-Path (Join-Path $DistPath "netlify.toml")) {
    Remove-Item -Path (Join-Path $DistPath "netlify.toml") -Force -ErrorAction SilentlyContinue
}

$zipStream = [System.IO.File]::Open($ZipPath, [System.IO.FileMode]::CreateNew)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

$distDir = Resolve-Path $DistPath
$files = Get-ChildItem -Path $distDir -Recurse -File

foreach ($file in $files) {
    # Calculate relative path from dist root
    $relPath = $file.FullName.Substring($distDir.Path.Length + 1)
    # Convert Windows backslash to standard forward slash for Linux / Netlify
    $entryName = $relPath.Replace("\", "/")
    
    $entry = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($file.FullName)
    
    $fileStream.CopyTo($entryStream)
    
    $fileStream.Dispose()
    $entryStream.Dispose()
}

$archive.Dispose()
$zipStream.Dispose()

$zipItem = Get-Item $ZipPath
Write-Host ("Successfully generated " + $ZipPath + " (" + [math]::Round($zipItem.Length / 1MB, 2) + " MB, " + $files.Count + " files)")

# Update Desktop and Downloads copies
$desktop = "$env:USERPROFILE\OneDrive\Desktop"
$downloads = "$env:USERPROFILE\Downloads"
if (Test-Path $desktop) {
    Copy-Item $ZipPath (Join-Path $desktop $ZipPath) -Force
    Write-Host "Updated Desktop copy: $desktop\$ZipPath"
}
if (Test-Path $downloads) {
    Copy-Item $ZipPath (Join-Path $downloads $ZipPath) -Force
    Write-Host "Updated Downloads copy: $downloads\$ZipPath"
}

