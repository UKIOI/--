from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.lan import router, rooms

def test_room_relay_and_identity(monkeypatch):
    monkeypatch.setattr('app.lan.lan_addresses', lambda: ['10.31.20.53'])
    app = FastAPI()
    app.include_router(router)
    with TestClient(app) as client:
        with client.websocket_connect('/api/lan') as host:
            host.send_json({'type': 'create', 'version': '1.1.0', 'name': 'Host'})
            welcome = host.receive_json()
            assert welcome['type'] == 'welcome'
            host.receive_json()
            with client.websocket_connect('/api/lan') as guest:
                guest.send_json({'type': 'join', 'version': '1.1.0', 'code': welcome['code'], 'name': 'Guest'})
                joined = guest.receive_json()
                roster = guest.receive_json()['players']
                assert len(roster) == 2 and roster[0]['color'] != roster[1]['color']
                host.receive_json()
                host.send_json({'type': 'start', 'options': {'mode': 'campaign', 'difficulty': 'easy', 'stage': 4}})
                assert host.receive_json()['type'] == 'start'
                assert guest.receive_json()['type'] == 'start'
                guest.send_json({'type': 'command', 'player': welcome['id'], 'command': {'type': 'drop', 'kind': 'wall', 'column': 10}})
                command = host.receive_json()
                assert command['player'] == joined['id']
                host.send_json({'type': 'state', 'world': {'tick': 60}})
                assert guest.receive_json()['world']['tick'] == 60
            assert host.receive_json()['type'] == 'left'
            assert len(host.receive_json()['players']) == 1
        assert not rooms

def test_incompatible_version_rejected():
    app = FastAPI()
    app.include_router(router)
    with TestClient(app) as client:
        with client.websocket_connect('/api/lan') as ws:
            ws.send_json({'type': 'create', 'version': '0.3.15'})
            assert ws.receive_json()['type'] == 'error'


def test_lan_addresses_excludes_local_only_interfaces(monkeypatch):
    import app.lan as lan
    monkeypatch.setattr(lan.socket, 'getaddrinfo', lambda *args: [(None, None, None, None, (ip, 0)) for ip in ['127.0.0.1', '0.0.0.0', '169.254.1.2', '10.31.20.53', '192.168.43.10', '10.31.20.53']])
    assert lan.lan_addresses() == ['10.31.20.53', '192.168.43.10']


def test_lan_addresses_failure_does_not_fall_back_to_loopback(monkeypatch):
    import app.lan as lan
    def failure(*args):
        raise OSError('No network')
    monkeypatch.setattr(lan.socket, 'getaddrinfo', failure)
    assert lan.lan_addresses() == []
