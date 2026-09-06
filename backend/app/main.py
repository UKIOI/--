import sqlite3
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from .api import router
app=FastAPI(title='战墙本地服务',version='1.0.0')
app.include_router(router)

@app.middleware('http')
async def size_limit(request:Request,call_next):
    # LAN guests keep solo progress in their own browser, never in the host's slot.
    if request.url.path.startswith('/api/v1/') and request.url.path != '/api/v1/config':
        from ipaddress import ip_address
        try:
            remote = not ip_address(request.client.host).is_loopback
        except ValueError:
            remote = False
        if remote:
            return JSONResponse({'error': {'code': 'LOCAL_ONLY', 'message': '单人存档服务仅限房主本机；队友使用浏览器本地存档。'}}, 403)
    if request.method in ['PUT','POST']:
        size=0
        chunks=[]
        async for chunk in request.stream():
            size+=len(chunk)
            if size>4*1024*1024: return JSONResponse({'error':{'code':'TOO_LARGE','message':'存档超过 4 MiB 上限'}},413)
            chunks.append(chunk)
        request._body=b''.join(chunks)
    return await call_next(request)

@app.exception_handler(HTTPException)
async def http_error(request,exc): return JSONResponse({'error':exc.detail if isinstance(exc.detail,dict) else {'code':'HTTP','message':str(exc.detail)}},exc.status_code)

@app.exception_handler(RequestValidationError)
async def validation_error(request,exc): return JSONResponse({'error':{'code':'VALIDATION','message':'数据字段、范围或引用非法：'+str(exc.errors()[0]['msg'])}},422)

@app.exception_handler(sqlite3.Error)
async def storage_error(request,exc): return JSONResponse({'error':{'code':'STORAGE','message':'数据库写入失败，请保留本地副本后重试'}},500)

from .lan import router as lan_router
app.include_router(lan_router)
from pathlib import Path
from fastapi.staticfiles import StaticFiles
frontend_dist = Path(__file__).resolve().parents[2] / 'frontend' / 'dist'
if frontend_dist.is_dir():
    app.mount('/', StaticFiles(directory=frontend_dist, html=True), name='game')
