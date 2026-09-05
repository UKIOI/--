import json
from pathlib import Path
LEGACY=json.loads((Path(__file__).resolve().parents[2]/'content/balance-v1.json').read_text(encoding='utf-8'))

def migrate(snapshot, config):
    if snapshot.balanceRevision>=config.get('balanceRevision',1):
        return
    for b in snapshot.buildings:
        old=LEGACY['buildings'].get(b.type); new=config['buildings'].get(b.type)
        if not old or not new: continue
        old_hp=old['branches'][b.branch].get('hp',old['hp']) if b.branch>=0 else old['hp']
        new_hp=new['branches'][b.branch].get('hp',new['hp']) if b.branch>=0 else new['hp']
        b.hp*=new_hp/old_hp
    for e in snapshot.enemies:
        old=LEGACY['enemies'].get(e.type); new=config['enemies'].get(e.type)
        if not old or not new: continue
        ratio=new['hp']/old['hp']
        e.hp*=ratio; e.maxHp*=ratio
        e.shield*=config['schedule']['reflectShield']/LEGACY['schedule']['reflectShield'] if e.type=='reflector' else ratio
        e.armor=min(.6,max(0,e.armor-old['armor']+new['armor']))
        e.reward=round(e.reward*new['reward']/old['reward'])
    snapshot.balanceRevision=config.get('balanceRevision',1)
