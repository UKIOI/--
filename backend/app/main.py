import sqlite3
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from .api import router
app=FastAPI(title='战墙本地服务',version='1.0.0')
app.include_router(router)

@app.middleware('http')
async def size_limit(request:Request,call_next):
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
