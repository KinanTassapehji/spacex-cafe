# PowerShell Deployment Script for SpaceX Gaming Cafe

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SpaceX Gaming Cafe - Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git initialized!" -ForegroundColor Green
}

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore..." -ForegroundColor Yellow
    @"
node_modules/
.env
build/
*.log
.DS_Store
dist/
.vscode/
.idea/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host ".gitignore created!" -ForegroundColor Green
}

# Build the client
Write-Host ""
Write-Host "Building React client..." -ForegroundColor Yellow
cd client
npm run build
cd ..
Write-Host "Client built successfully!" -ForegroundColor Green

# Add all files
Write-Host ""
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Prepare for production deployment"
}
git commit -m $commitMessage

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create a repository on GitHub" -ForegroundColor Yellow
Write-Host "2. Run these commands:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/spacex-gaming-cafe.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy to Render.com:" -ForegroundColor Yellow
Write-Host "   - Go to https://dashboard.render.com/" -ForegroundColor White
Write-Host "   - Click 'New +' -> 'Blueprint'" -ForegroundColor White
Write-Host "   - Connect your GitHub repository" -ForegroundColor White
Write-Host "   - Set MONGODB_URI environment variable" -ForegroundColor White
Write-Host ""
Write-Host "See RENDER_DEPLOYMENT.md for detailed instructions!" -ForegroundColor Green
Write-Host ""