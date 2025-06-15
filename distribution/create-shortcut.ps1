# Create desktop shortcut for AI Nayak
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath("Desktop") + "\AI Nayak.lnk")
$Shortcut.TargetPath = "C:\AI_Nayak\distribution\LAUNCH-SIMPLE.bat"
$Shortcut.WorkingDirectory = "C:\AI_Nayak\distribution"
$Shortcut.IconLocation = "C:\AI_Nayak\distribution\assets\icon.png"
$Shortcut.WindowStyle = 7  # Minimized
$Shortcut.Save()

Write-Host "Shortcut created on desktop"
