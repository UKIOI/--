import json
from pathlib import Path

CAMPAIGNS=json.loads((Path(__file__).resolve().parents[2]/'content/campaigns.json').read_text(encoding='utf-8'))

LEGACY_FINALE=json.loads((Path(__file__).resolve().parents[2]/'content/campaign-finale-legacy.json').read_text(encoding='utf-8'))
FINALE_V2=json.loads((Path(__file__).resolve().parents[2]/'content/campaign-finale-v2.json').read_text(encoding='utf-8'))
def campaign_for(stage, timeline_version=None):
    return CAMPAIGNS[stage] if stage!=4 or timeline_version==3 else FINALE_V2 if timeline_version==2 else LEGACY_FINALE
