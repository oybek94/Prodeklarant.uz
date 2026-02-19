# Windows'dan serverga deploy: SSH orqali loyihani yangilaydi va deploy.sh ni ishga tushiradi.
# Sozlash: quyidagi o'zgaruvchilarni o'z serveringizga moslang. Parol yoki SSH kalit bilan ishlaydi.

$SERVER_USER = "deploy"          # Server foydalanuvchi nomi
$SERVER_HOST = "prodeklarant.uz" # Server host yoki IP
$APP_PATH = "/var/www/prodeklarant.uz"  # Loyiha papkasi serverda

# Git ishlatilsa: serverda git pull; aks holda fayllarni boshqa usul bilan yuboring va skriptni git qismisiz ishlating
$UseGitPull = $true

$remoteCmd = "cd $APP_PATH && "
if ($UseGitPull) {
    $remoteCmd += "git pull && "
}
$remoteCmd += "chmod +x deploy/deploy.sh 2>/dev/null; ./deploy/deploy.sh"

Write-Host "==> SSH: $SERVER_USER@$SERVER_HOST"
Write-Host "==> Buyruq: $remoteCmd"
ssh "${SERVER_USER}@${SERVER_HOST}" "$remoteCmd"
