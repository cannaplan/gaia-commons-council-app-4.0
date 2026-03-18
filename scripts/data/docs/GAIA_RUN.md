mkdir -p docs
cat > docs/GAIA_RUN.md <<'MD'
# GAIA Master Platform — Run & Deploy Notes

How to run locally:
1. Ensure Python 3.10+ is installed.
2. Create a venv and install deps (no third-party packages are required by the script):
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

3. Run the platform script:
   python3 scripts/gaia_master_platform_v4_1_fixed.py

Expected outputs:
- data/gaia_v4.1_platform.db (SQLite DB with table `gaia_pilots`)
- data/gaia_slide_deck.json (the slide deck export)

Notes:
- The `data/` folder is added to .gitignore for generated artifacts.
- On ephemeral serverless hosts (e.g., Render free instances), files in data/ are ephemeral; for persistent storage use a managed DB or S3-compatible storage.
- The script exits with non-zero status on uncaught exceptions so CI/deploy platforms surface failures.
MD
