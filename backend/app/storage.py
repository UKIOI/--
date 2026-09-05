import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from .config import ROOT

@contextmanager
def connect():
    path=Path(os.environ.get('WARWALL_DB',str(ROOT/'data/warwall.sqlite3')))
    path.parent.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(path,timeout=10)
    db.row_factory=sqlite3.Row
    db.executescript('''CREATE TABLE IF NOT EXISTS save_slot (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, run_id TEXT, snapshot_json TEXT, saved_at TEXT);
    INSERT OR IGNORE INTO save_slot(id,revision) VALUES(1,0);
    CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),value_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS runs(run_id TEXT PRIMARY KEY,value_json TEXT NOT NULL,score INTEGER NOT NULL,ended_at TEXT NOT NULL);''')
    try:
        with db:
            yield db
    finally:
        db.close()
