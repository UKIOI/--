"""Ephemeral LAN rooms. The host simulates; identities are assigned by the relay."""
import asyncio
import json
import secrets
import time
import socket
from ipaddress import ip_address
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
rooms: dict = {}
COLORS = ['#77ddff', '#ffc56e', '#cc99ff', '#80e69b']

def lan_addresses():
    """Enumerate local IPv4 addresses without contacting an external service."""
    try:
        addresses = {entry[4][0] for entry in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET)}
        return sorted(address for address in addresses if not (
            ip_address(address).is_loopback or ip_address(address).is_unspecified
            or ip_address(address).is_link_local or ip_address(address).is_multicast))
    except OSError:
        return []

@router.get('/api/lan/status')
async def status():
    return {'version': '1.1.0', 'capacity': 4}

async def send(ws, data):
    try:
        await ws.send_json(data)
    except (RuntimeError, WebSocketDisconnect):
        pass

async def broadcast(room, data):
    for player in list(room['players'].values()):
        await send(player['ws'], data)

def roster(room):
    return [dict(id=p['id'], name=p['name'], color=p['color']) for p in room['players'].values()]

@router.websocket('/api/lan')
async def connect(ws: WebSocket):
    await ws.accept()
    code = None
    pid = secrets.token_hex(8)
    try:
        raw = await ws.receive_text()
        if len(raw) > 2048:
            return
        hello = json.loads(raw)
        if not isinstance(hello, dict) or hello.get('version') != '1.1.0':
            await send(ws, {'type': 'error', 'message': '请使用相同的 1.1.0 版本联机。'})
            return
        if hello.get('type') == 'create':
            code = secrets.token_hex(3).upper()
            while code in rooms:
                code = secrets.token_hex(3).upper()
            rooms[code] = {'host': pid, 'players': {}, 'started': False}
        else:
            code = str(hello.get('code', '')).strip().upper()
        room = rooms.get(code)
        if not room or room['started'] or len(room['players']) >= 4:
            await send(ws, {'type': 'error', 'message': '房间不存在、已开战或已满。'})
            code = None
            return
        used = {p['color'] for p in room['players'].values()}
        room['players'][pid] = {'id': pid, 'name': str(hello.get('name', '指挥官'))[:16] or '指挥官', 'color': next(c for c in COLORS if c not in used), 'ws': ws}
        try:
            addresses = await asyncio.wait_for(asyncio.to_thread(lan_addresses), timeout=2)
        except TimeoutError:
            addresses = []
        await send(ws, {'type': 'welcome', 'id': pid, 'code': code, 'host': room['host'], 'lanAddresses': addresses})
        await broadcast(room, {'type': 'roster', 'players': roster(room)})
        budget_at, count = time.monotonic(), 0
        while True:
            raw = await ws.receive_text()
            if len(raw) > (4_000_000 if pid == room['host'] else 4096):
                await ws.close(code=1009)
                break
            if time.monotonic() - budget_at > 1:
                budget_at, count = time.monotonic(), 0
            count += 1
            if count > 90:
                continue
            msg = json.loads(raw)
            if not isinstance(msg, dict):
                continue
            kind = msg.get('type')
            if kind == 'start' and pid == room['host']:
                options = msg.get('options', {})
                if not isinstance(options, dict) or options.get('mode') not in ['endless', 'test', 'campaign'] or options.get('difficulty') not in ['easy', 'normal', 'hard'] or type(options.get('stage')) is not int or not 0 <= options['stage'] < 5:
                    continue
                room['started'] = True
                await broadcast(room, {'type': 'start', 'players': roster(room), 'options': options, 'seed': secrets.randbits(32)})
            elif kind == 'state' and pid == room['host'] and room['started']:
                for other, player in list(room['players'].items()):
                    if other != pid:
                        await send(player['ws'], msg)
            elif kind == 'command' and room['started']:
                await send(room['players'][room['host']]['ws'], {'type': 'command', 'player': pid, 'command': msg.get('command')})
            elif kind == 'feedback' and pid == room['host']:
                recipient = room['players'].get(msg.get('player'))
                if recipient:
                    await send(recipient['ws'], {'type': 'feedback', 'message': str(msg.get('message', ''))[:200]})
    except (WebSocketDisconnect, ValueError, KeyError, RuntimeError):
        pass
    finally:
        room = rooms.get(code)
        if room and pid in room['players']:
            del room['players'][pid]
            if pid == room['host']:
                rooms.pop(code, None)
                await broadcast(room, {'type': 'ended', 'message': '房主已离开，联机战局结束。'})
                for p in list(room['players'].values()):
                    await p['ws'].close()
            else:
                await broadcast(room, {'type': 'left', 'player': pid})
                await broadcast(room, {'type': 'roster', 'players': roster(room)})
