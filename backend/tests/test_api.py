import json
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client(tmp_path,monkeypatch):
    monkeypatch.setenv('WARWALL_DB',str(tmp_path/'game.db'))
    return TestClient(app)

def snapshot():
    return dict(schemaVersion=1,configVersion=1,runId='test-run',seed=1,rng=1,nextEntityId=1,revision=0,tick=0,gold=300,coreHp=3000,maxThreat=1,kills=0,bossKills=0,alive=True,buildings=[],enemies=[],shots=[],spawnCredit=0,bossRequests=0,bossWarning=-1,bossCount=0,lastBossDeath=-999,nextBoss=300,nextPerk=120,passive=0,perks={},perkQueue=0,candidates=[],dropCooldown=0,commands=[])

def test_config_and_health(client):
    assert client.get('/api/v1/health').json()['status']=='ok'
    c=client.get('/api/v1/config').json()
    assert len(c['buildings'])==8 and len(c['enemies'])==8
    assert c['buildings']['wall']['hp']==650

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
    assert client.put('/api/v1/settings',json=s).json()==s
    assert TestClient(app).get('/api/v1/settings').json()==s
    s['sfxVolume']=2
    assert client.put('/api/v1/settings',json=s).status_code==422

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
