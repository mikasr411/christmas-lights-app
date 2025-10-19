Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.ExpandEnvironmentStrings("%USERPROFILE%\Desktop\Christmas Lights Estimator.lnk")
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = oWS.ExpandEnvironmentStrings("%USERPROFILE%\Documents\projects\christmas-lights-app\Start-App.bat")
oLink.WorkingDirectory = oWS.ExpandEnvironmentStrings("%USERPROFILE%\Documents\projects\christmas-lights-app")
oLink.IconLocation = oWS.ExpandEnvironmentStrings("%USERPROFILE%\Documents\projects\christmas-lights-app\assets\icon.ico")
oLink.Description = "Christmas Lights Estimation Tool"
oLink.Save
WScript.Echo "Desktop shortcut created successfully!"
