from test_api import client, snapshot

def test_three_boss_finale_and_timeline_survive_save(client):
    s=snapshot()
    s.update(campaign=dict(stage=4,spawned=3,won=False,timelineVersion=2),tick=36000,bossCount=3,nextEntityId=4,difficulty='hard')
    base=dict(x=30,y=5,hp=100,maxHp=100,shield=0,armor=0,attackScale=1,speedScale=1,reward=100,elite='',cooldown=0,slows=[],skill=0,summon=0,state='walk',timer=0,distance=0,target=0)
    s['enemies']=[dict(base,id=i+1,type=kind) for i,kind in enumerate(['queen','carrier','leviathan'])]
    response=client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s})
    assert response.status_code==200,response.text
    saved=client.get('/api/v1/save').json()['snapshot']
    assert saved['campaign']['timelineVersion']==2
    assert len(saved['enemies'])==3
    s['campaign']['won']=True
    s['enemies']=[]
    s['bossKills']=2
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==422
    s['bossKills']=3
    assert client.put('/api/v1/save',json={'expectedRevision':1,'snapshot':s}).status_code==200

def test_old_finale_cannot_gain_new_boss_or_third_slot(client):
    s=snapshot()
    s['campaign']=dict(stage=4,spawned=3,won=False)
    assert client.put('/api/v1/save',json={'expectedRevision':0,'snapshot':s}).status_code==422
