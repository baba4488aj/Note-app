LUMENWILD - WINDOWS DESKTOP LAUNCHER

1. Install Node.js 20 or newer once from https://nodejs.org (LTS recommended).
2. Extract the entire ZIP into any normal folder. Do not run it from inside the ZIP.
3. Double-click Start-Lumenwild.cmd. The game opens in a dedicated Microsoft Edge window.
   If Edge is unavailable, it opens in your default browser instead.
4. Keep the launcher console open while playing. Close it after closing the game.

SAVES
Your desktop progress is stored separately from the extracted game files:
%APPDATA%\Lumenwild\save.json
The previous successful save is kept as save.backup.json in that same folder.
All saves stay on this PC. There are no accounts or cloud sync.

BRING YOUR CURRENT PROGRESS
First replace your existing browser HTML with the updated Lumenwild.html using the
same filename and location (or keep the same localhost URL). Then open it and
select Saves > Export save backup. This makes the export read your current progress.
In the desktop game, select Saves > Import save backup and choose that JSON file.
If you import the wrong file, Saves > Restore progress from before the last import undoes it.
A fresh desktop install starts with starter pets until you import your browser save.

UPDATE WITHOUT RESETTING PROGRESS
1. Export a backup from Saves if you want an extra copy.
2. Close the game window and its launcher console.
3. Replace the extracted game folder with the complete newer desktop release.
4. Run Start-Lumenwild.cmd again. It reads the existing save from your profile.
Do not delete the Lumenwild folder in APPDATA when updating.
Automatic update downloads and an .exe installer are not configured in this build.

OFFLINE PLAY
After Node.js is installed, the game needs no internet connection or npm install.
The launcher runs a local server bound only to 127.0.0.1 on port 57841.
Progress survives changing the game folder, replacing game files, and clearing browser storage.

If the launcher says a save needs a newer game version, use the newer release.
If a save is corrupt, the launcher tries the previous-save backup and keeps the original files.
