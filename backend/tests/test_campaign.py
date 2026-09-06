from test_api import client, snapshot

def test_campaign_dual_boss_and_victory_save(client):
    s=snapshot()
    s.update(campaign=dict(stage=4,spawned=2,won=False),tick=18000,bossCount=2,nextEntityId=3,difficulty='hard')
    base=dict(x=30,y=5,hp=100,maxHp=100,shield=0,armor=0,attackScale=1,speedScale=1,reward=100,elite='',cooldown=0,slows=[],skill=0,summon=0,state='walk',timer=0,distance=0,target=0)
    s['enemies']=[dict(base,id=1,type='carrier'),dict(base,id=2,type='queen')]
    response=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s})
    assert response.status_code==200,response.text
    assert len(client.get('/api/v1/save').json()['snapshot']['enemies'])==2
    s['campaign']['won']=True
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422
    s['enemies']=[]
    s['bossKills']=2
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==200
    assert client.get('/api/v1/save').json()['snapshot']['campaign']['won']
    assert client.put('/api/v1/settings',json={'campaignCleared':5}).status_code==200
    assert client.get('/api/v1/settings').json()['campaignCleared']==5
    assert client.put('/api/v1/settings',json={'campaignCleared':0}).json()['campaignCleared']==5

def test_campaign_rejects_locked_buildings_and_standard_double_bosses(client):
    s=snapshot()
    s.update(campaign=dict(stage=0,spawned=0,won=False),nextEntityId=2)
    s['buildings']=[dict(id=1,type='sniper',branch=-1,spent=190,x=5.5,y=.5,v=0,hp=200,settled=True,fallId=1,hit=[],cooldown=0)]
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==422
    assert client.put('/api/v1/settings',json={'campaignCleared':6}).status_code==422
