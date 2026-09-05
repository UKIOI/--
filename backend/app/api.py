import json
import math
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Response, Query
from .schemas import Settings, SaveRequest, SaveMeta, SaveResource, RunRequest, Run, Runs, GameConfig
from .storage import connect
from .config import config
router=APIRouter(prefix='/api/v1')
def now(): return datetime.now(timezone.utc).isoformat()
def fail(status,code,message): raise HTTPException(status,detail={'code':code,'message':message})

@router.get('/health')
def health(): return {'status':'ok','apiVersion':1}

@router.get('/config',response_model=GameConfig)
def get_config(): return config

@router.get('/save',response_model=SaveResource|None)
def get_save(response:Response):
    with connect() as db: row=db.execute('SELECT * FROM save_slot WHERE id=1').fetchone()
    response.headers['X-Save-Revision']=str(row['revision'])
    if row['snapshot_json'] is None:
        return Response(status_code=204,headers={'X-Save-Revision':str(row['revision'])})
    return {'revision':row['revision'],'savedAt':row['saved_at'],'snapshot':json.loads(row['snapshot_json'])}

@router.put('/save',response_model=SaveMeta)
def put_save(req:SaveRequest):
    if req.snapshot.schemaVersion!=1 or req.snapshot.configVersion!=config['configVersion']:
        fail(409,'VERSION','存档版本不兼容，请导出备份后新开游戏')
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        revision=db.execute('SELECT revision FROM save_slot WHERE id=1').fetchone()[0]
        if revision!=req.expectedRevision: fail(409,'REVISION','存档已被另一页面修改，请选择要保留的存档')
        revision+=1
        snapshot=req.snapshot.model_dump()
        snapshot['revision']=revision
        saved=now()
        db.execute('UPDATE save_slot SET revision=?,run_id=?,snapshot_json=?,saved_at=? WHERE id=1',(revision,snapshot['runId'],json.dumps(snapshot,ensure_ascii=False),saved))
    return {'revision':revision,'savedAt':saved}

@router.delete('/save',status_code=204)
def delete_save(runId:str,expectedRevision:int=Query(ge=0)):
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        row=db.execute('SELECT * FROM save_slot WHERE id=1').fetchone()
        if row['revision']!=expectedRevision or row['run_id']!=runId: fail(409,'REVISION','存档版本或游戏编号不一致')
        db.execute('UPDATE save_slot SET revision=revision+1,run_id=NULL,snapshot_json=NULL,saved_at=NULL WHERE id=1')

@router.get('/settings',response_model=Settings)
def get_settings():
    with connect() as db: row=db.execute('SELECT value_json FROM settings WHERE id=1').fetchone()
    return json.loads(row[0]) if row else Settings()

@router.put('/settings',response_model=Settings)
def put_settings(value:Settings):
    with connect() as db: db.execute('INSERT OR REPLACE INTO settings VALUES(1,?)',(value.model_dump_json(),))
    return value

@router.get('/runs',response_model=Runs)
def get_runs(limit:int=Query(20,ge=1,le=100)):
    with connect() as db:
        rows=db.execute('SELECT value_json FROM runs ORDER BY ended_at DESC LIMIT ?',(limit,)).fetchall()
        best=db.execute('SELECT COALESCE(MAX(score),0) FROM runs').fetchone()[0]
    return {'items':[json.loads(r[0]) for r in rows],'bestScore':best}

@router.post('/runs',response_model=Run,status_code=201)
def post_run(value:RunRequest,response:Response):
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        row=db.execute('SELECT value_json FROM runs WHERE run_id=?',(value.runId,)).fetchone()
        if row:
            response.status_code=200
            return json.loads(row[0])
        result={**value.model_dump(),'survivalSeconds':value.durationTicks/60,'score':math.floor(value.durationTicks/60)*10+value.kills*5+value.bossKills*500,'endedAt':now()}
        db.execute('INSERT INTO runs VALUES(?,?,?,?)',(value.runId,json.dumps(result),result['score'],result['endedAt']))
        db.execute('UPDATE save_slot SET revision=revision+1,run_id=NULL,snapshot_json=NULL,saved_at=NULL WHERE id=1 AND run_id=?',(value.runId,))
    return result
