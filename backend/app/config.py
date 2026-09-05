import json
from pathlib import Path
from .schemas import GameConfig
ROOT = Path(__file__).resolve().parents[2]
config = GameConfig.model_validate_json((ROOT/'content/game-config.json').read_text(encoding='utf-8')).model_dump()
