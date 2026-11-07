#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Try finding python virtual environment
if [ -d "$DIR/.venv" ]; then
    PYTHON="$DIR/.venv/bin/python"
elif [ -d "$DIR/venv" ]; then
    PYTHON="$DIR/venv/bin/python"
elif [ -d "$DIR/../model/venv" ]; then
    PYTHON="$DIR/../model/venv/bin/python"
elif [ -d "/Users/aditya/coding/pedestrian-crowd-detection-models/venv" ]; then
    PYTHON="/Users/aditya/coding/pedestrian-crowd-detection-models/venv/bin/python"
elif command -v python3 &>/dev/null; then
    PYTHON="python3"
else
    echo "Error: Python 3 not found!"
    exit 1
fi

echo "Starting Vigilo AI Backend with: $PYTHON"
exec "$PYTHON" main.py "$@"
