import json
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client(tmp_path,monkeypatch):
    monkeypatch.setenv('WARWALL_DB',str(tmp_path/'game.db'))
    return TestClient(app)

def snapshot():
    return dict(balanceRevision=2,schemaVersion=1,configVersion=1,runId='test-run',seed=1,rng=1,nextEntityId=1,revision=0,tick=0,gold=300,coreHp=3000,maxThreat=1,kills=0,bossKills=0,alive=True,buildings=[],enemies=[],shots=[],spawnCredit=0,bossRequests=0,bossWarning=-1,bossCount=0,lastBossDeath=-999,nextBoss=300,nextPerk=120,passive=0,perks={},perkQueue=0,candidates=[],dropCooldown=0,commands=[])

def test_config_and_health(client):
    assert client.get('/api/v1/health').json()['status']=='ok'
    c=client.get('/api/v1/config').json()
    assert len(c['buildings'])==14 and len(c['enemies'])==20
    assert c['buildings']['wall']['hp']==720

def test_save_revision_and_restart(client):
    empty=client.get('/api/v1/save')
    assert empty.status_code==204 and empty.headers['X-Save-Revision']=='0'
    r=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':snapshot()})
    assert r.status_code==200 and r.json()['revision']==1
    assert TestClient(app).get('/api/v1/save').json()['snapshot']['runId']=='test-run'
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':snapshot()}).status_code==409
    assert client.delete('/api/v1/save?runId=test-run&expectedRevision=1').status_code==204
    assert client.get('/api/v1/save').headers['X-Save-Revision']=='2'

def test_validation_and_size(client):
    s=snapshot();s['gold']=-1
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==422
    s=snapshot();s['schemaVersion']=2
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==409
    s=snapshot();s['commands']=[{'type':'drop','kind':'fake','column':9}]
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==422
    r=client.put('/api/v1/save',content=b' '* (4*1024*1024+1))
    assert r.status_code==413 and 'error' in r.json()

def test_settings(client):
    assert client.get('/api/v1/settings').json()['musicVolume']==.3
    s=dict(musicVolume=.2,sfxVolume=.5,reducedMotion=True,tutorialSeen=True)
    assert client.put('/api/v1/settings',json=s).json()=={**s,'background':'city','layout':'expanded','campaignCleared':0,'falseEndingAchievement':False}
    assert TestClient(app).get('/api/v1/settings').json()=={**s,'background':'city','layout':'expanded','campaignCleared':0,'falseEndingAchievement':False}
    s['sfxVolume']=2
    assert client.put('/api/v1/settings',json=s).status_code==422

def test_left_front_save_requires_unlocked_test_mode(client):
    s=snapshot()
    s.update(testMode=True,leftOpened=True,tick=36000,nextLeft=620,nextEntityId=3)
    s['buildings']=[dict(id=1,type='wall',branch=-1,spent=45,x=-9.5,y=.5,v=0,hp=720,settled=True,fallId=1,hit=[],cooldown=0)]
    s['enemies']=[dict(id=2,type='grunt',side='left',x=-25,y=.5,hp=50,maxHp=50,shield=0,armor=0,attackScale=1,speedScale=1,reward=10,elite='',cooldown=0,slows=[],skill=0,summon=0,state='walk',timer=0,distance=0,target=1)]
    s['commands']=[dict(type='drop',kind='wall',column=-8)]
    result=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s})
    assert result.status_code==200,result.text
    loaded=client.get('/api/v1/save').json()['snapshot']
    assert loaded['buildings'][0]['x']==-9.5 and loaded['enemies'][0]['side']=='left'
    assert loaded['nextLeft']==620 and loaded['testMode']
    s['testMode']=False
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422
    s['testMode']=True
    s['tick']=35999
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422

def test_layout_and_squads_persist(client):
    assert client.put('/api/v1/settings',json={'layout':'classic'}).status_code==200
    assert client.get('/api/v1/settings').json()['layout']=='classic'
    assert client.put('/api/v1/settings',json={'layout':'unknown'}).status_code==422
    s=snapshot()
    s['squads']=[[],[],[],[],[]]
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==200
    assert client.get('/api/v1/save').json()['snapshot']['squads']==s['squads']
    s['squads']=[[0]]
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422

def test_background_settings_persist_and_validate(client):
    for background in ['city','harbor','desert','snow','classic']:
        response=client.put('/api/v1/settings',json={'background':background})
        assert response.status_code==200
        assert TestClient(app).get('/api/v1/settings').json()['background']==background
    assert client.put('/api/v1/settings',json={'background':'unknown'}).status_code==422
    assert client.get('/api/v1/settings').json()['background']=='classic'

def test_tactical_entities_and_lift_command_persist(client):
    s=snapshot()
    s['enemies']=[dict(id=1,type='carrier',x=20,y=10,hp=1000,maxHp=1000,shield=0,armor=0,attackScale=1,speedScale=1,reward=200,elite='',cooldown=0,slows=[],skill=0,summon=0,state='walk',timer=0,distance=0,target=0,parts=dict(hangar=0,missiles=90,max=180),weakUntil=20)]
    s['shots']=[dict(id=2,owner=2147483646,kind='wreck',phase='warning',x=10,y=0,originX=10,originY=9,remaining=2,duration=3,damage=450,radius=4)]
    s['buildings']=[dict(id=3,type='interceptor',branch=-1,spent=210,x=5.5,y=.5,v=0,hp=260,settled=True,fallId=1,hit=[],cooldown=2)]
    s['crate']=dict(x=20.5,y=1.6,hp=350,remaining=30,progress=10,falling=False)
    s['commands']=[dict(type='relocate',id=3,column=7,layer=0)]
    s['event']=dict(kind='supply',remaining=5,columns=[20])
    s['nextEntityId']=4
    response=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s})
    assert response.status_code==200, response.text
    loaded=client.get('/api/v1/save').json()['snapshot']
    assert loaded['enemies'][0]['parts']['hangar']==0 and loaded['enemies'][0]['weakUntil']==20
    assert loaded['shots'][0]['kind']=='wreck' and loaded['crate']['progress']==10
    assert loaded['commands'][0]['type']=='relocate'
    assert loaded['commands'][0]['layer']==0
    s['commands'][0]['layer']=12
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422
    s['commands'][0]['layer']=0
    s['commands'][0]['column']=30
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422

def test_fortress_and_squad_persistence(client):
    s=snapshot()
    base=dict(x=25,y=7,hp=100,maxHp=100,shield=0,armor=0,attackScale=1,speedScale=1,reward=20,elite='',cooldown=0,slows=[],skill=0,summon=4,state='walk',timer=0,distance=0,target=0)
    s['enemies']=[dict(base,id=1,type='marshal'),dict(base,id=2,type='fortress'),dict(base,id=3,type='suicide_ship',state='rally',timer=8,squad=1)]
    s['shots']=[dict(id=4,owner=2147483646,kind='wreck',visual='fortress',phase='warning',x=10,y=0,originX=10,originY=7,remaining=2,duration=3,damage=320,radius=4)]
    s['nextEntityId']=5
    result=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s})
    assert result.status_code==200, result.text
    loaded=client.get('/api/v1/save').json()['snapshot']
    assert loaded['enemies'][2]['squad']==1 and loaded['enemies'][2]['state']=='rally'
    assert loaded['shots'][0]['visual']=='fortress'

@pytest.mark.parametrize('state', ['burrow', 'erupt', 'exposed'])
@pytest.mark.parametrize('event', ['meteor', 'breach', 'sabotage', 'siege'])
def test_new_boss_and_event_persistence(client, state, event):
    s=snapshot()
    s['enemies']=[dict(id=1,type='sandworm',x=10.5,y=0,hp=3200,maxHp=3200,shield=0,armor=0,attackScale=1,speedScale=1,reward=260,elite='',cooldown=0,slows=[],skill=0,summon=0,state=state,timer=3,distance=0,target=0)]
    s['nextEntityId']=2
    s['event']=dict(kind=event,remaining=5,columns=[8,12,16])
    response=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s})
    assert response.status_code==200, response.text
    loaded=client.get('/api/v1/save').json()['snapshot']
    assert loaded['enemies'][0]['state']==state
    assert loaded['event']['kind']==event

def test_bridge_and_cannon_persistence(client):
    s=snapshot()
    s['buildings']=[dict(id=1,type='bridge',branch=-1,spent=35,x=3.5,y=1.5,v=0,hp=300,settled=True,fallId=1,hit=[],cooldown=0)]
    s['shots']=[dict(id=2,owner=1,kind='cannon',originX=3.5,originY=2.5,x=8,y=.5,remaining=.2,duration=.25,damage=90,radius=1.5)]
    s['nextEntityId']=3
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==200
    loaded=client.get('/api/v1/save').json()['snapshot']
    assert loaded['buildings'][0]['y']==1.5 and loaded['shots'][0]['kind']=='cannon'
    s['commands']=[dict(type='drop',kind='bridge',column=4,layer=30)]
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422

def test_arrow_persistence(client):
    s=snapshot()
    s['shots']=[dict(id=1,owner=99,kind='arrow',phase='flight',originX=10.98,originY=.5,x=16,y=.5,remaining=.15,duration=.23,damage=28,radius=0)]
    s['nextEntityId']=100
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==200
    loaded=client.get('/api/v1/save').json()['snapshot']['shots'][0]
    assert loaded['kind']=='arrow' and loaded['remaining']==.15

def test_difficulty_and_bullet_persistence(client):
    s=snapshot();s['difficulty']='hard'
    s['shots']=[dict(id=1,owner=99,kind='bullet',phase='flight',originX=5,originY=1,x=20,y=.5,remaining=.2,duration=.4,damage=200,radius=0)]
    s['nextEntityId']=2
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==200
    loaded=client.get('/api/v1/save').json()['snapshot']
    assert loaded['difficulty']=='hard' and loaded['shots'][0]['kind']=='bullet'
    s['difficulty']='impossible'
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422

def test_legacy_balance_migrates_once_and_keeps_spending(client):
    s=snapshot();s.pop('balanceRevision')
    s['buildings']=[dict(id=1,type='mine',branch=1,spent=200,x=5.5,y=.5,v=0,hp=300,settled=True,fallId=1,hit=[],cooldown=2)]
    s['nextEntityId']=2
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==200
    loaded=client.get('/api/v1/save').json()['snapshot']
    assert loaded['balanceRevision']==2 and loaded['buildings'][0]['hp']==225
    assert loaded['buildings'][0]['spent']==200
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':loaded}).status_code==200
    assert client.get('/api/v1/save').json()['snapshot']['buildings'][0]['hp']==225

def test_incident_and_airdrop_persistence(client):
    s=snapshot()
    s.update(nextEvent=260,eventCount=2,eventDebt=3,event=dict(kind='missiles',remaining=4,columns=[1,5,9]))
    s['enemies']=[dict(id=1,type='reflector',x=16,y=8,hp=220,maxHp=220,shield=80,armor=0,attackScale=1,speedScale=1,reward=24,elite='',cooldown=0,slows=[],skill=5,summon=15,state='walk',timer=0,distance=0,target=0,descent=True)]
    s['nextEntityId']=2
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==200
    saved=client.get('/api/v1/save').json()['snapshot']
    assert saved['event']==s['event'] and saved['eventDebt']==3
    assert saved['enemies'][0]['descent'] and saved['enemies'][0]['shield']==80
    s['event']['columns']=[24]
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422

def test_physical_bomb_and_skill_warning_persistence(client):
    s=snapshot()
    s['shots']=[dict(id=1,owner=99,kind='bomb',phase='flight',visual='missile',originX=18,originY=10.65,x=2.5,y=0,remaining=.5,duration=.9,damage=65,radius=.8),dict(id=2,owner=99,kind='shockwave',phase='warning',originX=8,originY=1,x=8,y=.3,remaining=1,duration=1.4,damage=100,radius=3)]
    s['nextEntityId']=100
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==200
    loaded=client.get('/api/v1/save').json()['snapshot']['shots']
    assert loaded[0]['phase']=='flight' and loaded[0]['originY']==10.65
    assert loaded[1]['kind']=='shockwave' and loaded[1]['remaining']==1

def test_runs_idempotent_only_clear_matching(client):
    client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':snapshot()})
    run=dict(runId='another',durationTicks=600,kills=2,bossKills=1,maxThreat=1)
    assert client.post('/api/v1/runs',json=run).status_code==201
    assert client.get('/api/v1/save').status_code==200
    run['runId']='test-run'
    first=client.post('/api/v1/runs',json=run)
    assert first.status_code==201 and first.json()['score']==610
    again=client.post('/api/v1/runs',json=run)
    assert again.status_code==200 and again.json()==first.json()
    assert client.get('/api/v1/save').status_code==204
    assert client.get('/api/v1/save').headers['X-Save-Revision']=='2'
    assert len(client.get('/api/v1/runs').json()['items'])==2

def test_fractional_economy_save(client):
    s=snapshot();s["gold"]=301.5
    assert client.put("/api/v1/save",json={"expectedRevision":0,"snapshot":s}).status_code==200
    assert client.get("/api/v1/save").json()["snapshot"]["gold"]==301.5

def test_projection_checkpoint(client):
    s=snapshot()
    s['buildings']=[dict(id=1,type='decoy',branch=-1,spent=220,x=10.5,y=.5,v=0,hp=280,settled=True,fallId=1,hit=[],cooldown=18)]
    s['nextEntityId']=2
    s['projection']=dict(owner=1,x=29,y=1,remaining=4)
    r=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s})
    assert r.status_code==200,r.text
    assert client.get('/api/v1/save').json()['snapshot']['projection']==s['projection']
    s['projection']['owner']=99
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422
