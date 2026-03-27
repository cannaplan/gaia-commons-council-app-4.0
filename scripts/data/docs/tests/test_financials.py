mkdir -p tests
cat > tests/test_financials.py <<'PYT'
import os
import sqlite3
import pytest
from pathlib import Path
import asyncio

from scripts.gaia_master_platform_v4_1_fixed import CompliantPilotSimulator, GaiaDataCompliance

@pytest.mark.asyncio
async def test_npv_and_db_written(tmp_path):
    # run the simulator and ensure outputs are created and DB rows inserted
    cwd = Path.cwd()
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    # run in the temporary directory to avoid filesystem pollution
    os.chdir(tmp_path)

    try:
        collector = GaiaDataCompliance()
        sim = CompliantPilotSimulator(collector)
        results = await sim.run_full_platform()

        # Check data files exist
        assert (data_dir / "gaia_slide_deck.json").exists()
        db_file = data_dir / "gaia_v4.1_platform.db"
        assert db_file.exists()

        # Check database has rows and numeric npv stored
        conn = sqlite3.connect(str(db_file))
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM gaia_pilots;")
        count = cur.fetchone()[0]
        assert count >= 2

        cur.execute("SELECT npv, roi_pct FROM gaia_pilots LIMIT 1;")
        row = cur.fetchone()
        assert row is not None
        npv_val, roi_val = row
        assert isinstance(npv_val, float) or isinstance(npv_val, (int,))
        assert isinstance(roi_val, float) or isinstance(roi_val, (int,))
    finally:
        os.chdir(cwd)
PYT
