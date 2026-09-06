import json
from pathlib import Path

CAMPAIGNS=json.loads((Path(__file__).resolve().parents[2]/'content/campaigns.json').read_text(encoding='utf-8'))
