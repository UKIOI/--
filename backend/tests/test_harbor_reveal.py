from test_api import client, snapshot

def test_cinematic_checkpoint_and_achievement_persist(client):
    s=snapshot()
    s.update(campaign=dict(stage=4,timelineVersion=3,spawned=2,won=False,carrierCrashed=True,revealFrame=360,storm=False),tick=37000,bossCount=2,bossKills=2)
    response=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s})
    assert response.status_code==200,response.text
    assert client.get('/api/v1/save').json()['snapshot']['campaign']['revealFrame']==360
    assert client.put('/api/v1/settings',json={'falseEndingAchievement':True}).status_code==200
    assert client.put('/api/v1/settings',json={'falseEndingAchievement':False}).json()['falseEndingAchievement']
    s['campaign']['storm']=True
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422

def test_new_reveal_fields_require_the_new_finale(client):
    s=snapshot()
    s['campaign']=dict(stage=4,timelineVersion=2,spawned=2,carrierCrashed=True,revealFrame=0)
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==422
