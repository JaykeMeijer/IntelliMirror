#!/bin/bash
cd "$(dirname "$(realpath "$0")")"
unclutter -idle 10 &
python3 screencontrol/screen.py &
src/node_modules/electron/dist/electron /home/jayke/IntelliMirror/src
