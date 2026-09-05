"""Format the authoritative configuration without resetting tuned balance values."""
import json
from pathlib import Path
path=Path(__file__).with_name('game-config.json')
config=json.loads(path.read_text(encoding='utf-8'))
assert config['configVersion']==1
assert all(key in config for key in ['world','buildings','enemies','perks','schedule'])
path.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Configuration formatted; balance values preserved.')
