from typing import Annotated, Any, Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator
Finite = Annotated[float, Field(allow_inf_nan=False)]

class Settings(BaseModel):
    musicVolume: float = Field(.3, ge=0, le=1)
    sfxVolume: float = Field(.7, ge=0, le=1)
    reducedMotion: bool = False
    tutorialSeen: bool = False

class BuildingConfig(BaseModel):
    model_config = ConfigDict(extra='allow')
    name: str
    cost: int = Field(gt=0)
    hp: float = Field(gt=0)
    impact: float = Field(ge=0)
    interval: float = Field(ge=0)
    range: float = Field(ge=0)
    branches: list[dict[str, Any]] = Field(min_length=2, max_length=2)

class GameConfig(BaseModel):
    balanceRevision: int = Field(1, ge=1, le=2)
    configVersion: Literal[1]
    world: dict[str, float]
    buildings: dict[str, BuildingConfig]
    enemies: dict[str, dict[str, Any]]
    perks: dict[str, dict[str, Any]]
    schedule: dict[str, float]

class Building(BaseModel):
    id: int = Field(gt=0)
    type: str
    branch: int = Field(ge=-1, le=1)
    spent: int = Field(ge=0)
    x: Finite = Field(ge=.5, le=23.5)
    y: Finite = Field(ge=.5, le=16)
    v: Finite = Field(ge=0, le=18)
    hp: Finite = Field(gt=0)
    settled: bool
    fallId: int = Field(ge=1)
    hit: list[int]
    cooldown: Finite = Field(ge=0)

class Slow(BaseModel):
    amount: Finite = Field(ge=0, le=1)
    until: Finite = Field(ge=0)

class Enemy(BaseModel):
    descent: bool = False
    special: Finite | None = None
    secondary: Finite | None = None
    attackAnim: Finite = Field(0, ge=0, le=1)
    id: int = Field(gt=0)
    type: str
    x: Finite = Field(ge=0, le=40)
    y: Finite = Field(ge=0, le=16)
    hp: Finite = Field(gt=0)
    maxHp: Finite = Field(gt=0)
    shield: Finite = Field(ge=0)
    armor: Finite = Field(ge=0, le=.6)
    attackScale: Finite = Field(gt=0)
    speedScale: Finite = Field(gt=0, le=1.3)
    reward: int = Field(ge=0)
    elite: Literal['', 'shield', 'armor']
    cooldown: Finite = Field(ge=0)
    slows: list[Slow]
    skill: Finite
    summon: Finite
    state: Literal['walk', 'charge', 'dash', 'fuse', 'leap', 'recover', 'burrow', 'erupt', 'exposed']
    timer: Finite
    distance: Finite
    target: int

class Shot(BaseModel):
    phase: Literal['warning', 'flight'] | None = None
    visual: str | None = None
    originX: Finite | None = None
    originY: Finite | None = None
    id: int = Field(gt=0)
    owner: int = Field(gt=0)
    kind: Literal['mortar', 'bomb', 'cannon', 'arrow', 'bullet', 'rock', 'shockwave', 'laser']
    x: Finite
    y: Finite
    remaining: Finite = Field(gt=0)
    duration: Finite = Field(gt=0)
    damage: Finite = Field(ge=0)
    radius: Finite = Field(ge=0)

class Incident(BaseModel):
    kind: Literal['missiles', 'airdrop', 'meteor', 'breach', 'sabotage', 'siege']
    remaining: Finite = Field(gt=0, le=6)
    columns: list[Annotated[int, Field(ge=0, le=23)]] = Field(max_length=3)

class Snapshot(BaseModel):
    balanceRevision: int = Field(1, ge=1, le=2)
    difficulty: Literal['easy', 'normal', 'hard'] = 'easy'
    nextEvent: Finite | None = None
    eventCount: int = Field(0, ge=0)
    eventDebt: int = Field(0, ge=0)
    event: Incident | None = None
    schemaVersion: int
    configVersion: int
    runId: str = Field(min_length=1, max_length=100, pattern=r'^[a-zA-Z0-9_-]+$')
    seed: int = Field(ge=1, le=4294967295)
    rng: int = Field(ge=1, le=4294967295)
    nextEntityId: int = Field(gt=0)
    revision: int = Field(ge=0)
    tick: int = Field(ge=0)
    gold: int = Field(ge=0)
    coreHp: Finite = Field(gt=0, le=3000)
    maxThreat: int = Field(ge=1)
    kills: int = Field(ge=0)
    bossKills: int = Field(ge=0)
    alive: Literal[True]
    buildings: list[Building] = Field(max_length=312)
    enemies: list[Enemy] = Field(max_length=181)
    shots: list[Shot] = Field(max_length=2000)
    spawnCredit: Finite = Field(ge=0, lt=1.01)
    bossRequests: int = Field(ge=0, le=1)
    bossWarning: Finite
    bossCount: int = Field(ge=0)
    lastBossDeath: Finite
    nextBoss: Finite = Field(gt=0)
    nextPerk: Finite = Field(gt=0)
    passive: Finite = Field(ge=-.000001, le=5)
    perks: dict[str, int]
    perkQueue: int = Field(ge=0)
    candidates: list[str] = Field(max_length=3)
    dropCooldown: Finite = Field(ge=0, le=1.2)
    commands: list[dict[str, Any]] = Field(max_length=100)

    @model_validator(mode='after')
    def references(self):
        from .config import config
        from .balance import migrate
        migrate(self,config)
        ids=[x.id for x in [*self.buildings,*self.enemies,*self.shots]]
        if len(ids)!=len(set(ids)) or any(i>=self.nextEntityId for i in ids):
            raise ValueError('实体 ID 重复或 nextEntityId 非法')
        for b in self.buildings:
            if b.type not in config['buildings'] or b.x % 1 != .5 or (b.settled and (b.y % 1 != .5 or b.y>11.5)):
                raise ValueError('建筑类型或网格位置非法')
            base=config['buildings'][b.type]
            maximum=base['branches'][b.branch].get('hp',base['hp']) if b.branch>=0 else base['hp']
            if b.hp>maximum*(1+.15*self.perks.get('durability',0))+.00001:
                raise ValueError('建筑生命超过上限')
        for col in range(24):
            top=2 if col in [1,2] else 0
            for b in sorted([b for b in self.buildings if int(b.x)==col],key=lambda b:b.y):
                if b.y-.5<top-.00001:
                    raise ValueError('建筑相互重叠或与核心重叠')
                top=b.y+.5
        for e in self.enemies:
            if e.type not in config['enemies'] or e.hp>e.maxHp:
                raise ValueError('敌人类型或生命非法')
        if sum(config['enemies'][e.type]['boss'] for e in self.enemies)>1:
            raise ValueError('Boss 数量非法')
        for k,v in self.perks.items():
            if k not in config['perks'] or v<0 or v>config['perks'][k]['max']:
                raise ValueError('强化非法')
        if len(self.candidates)!=len(set(self.candidates)) or any(k not in config['perks'] and k!='supply' for k in self.candidates):
            raise ValueError('强化候选非法')
        for c in self.commands:
            if c.get('type')=='drop':
                if c.get('kind') not in config['buildings'] or not isinstance(c.get('column'),int) or not 0<=c['column']<24:
                    raise ValueError('投放命令非法')
                if c.get('kind')=='bridge' and (not isinstance(c.get('layer'),int) or not 0<=c['layer']<12):
                    raise ValueError('桥梁层数非法')
            elif c.get('type')=='upgradeMany':
                if c.get('branch') not in [0,1] or not isinstance(c.get('ids'),list) or len(c['ids'])>312 or any(i not in [b.id for b in self.buildings] for i in c['ids']):
                    raise ValueError('批量升级引用非法')
            elif c.get('type')=='upgrade':
                if c.get('branch') not in [0,1] or c.get('id') not in [b.id for b in self.buildings]:
                    raise ValueError('升级引用非法')
            else:
                raise ValueError('不允许持久化该命令')
        return self

class SaveRequest(BaseModel):
    expectedRevision: int = Field(ge=0)
    snapshot: Snapshot

class SaveMeta(BaseModel):
    revision: int
    savedAt: str

class SaveResource(SaveMeta):
    snapshot: Snapshot

class RunRequest(BaseModel):
    runId: str = Field(min_length=1, max_length=100, pattern=r'^[a-zA-Z0-9_-]+$')
    durationTicks: int = Field(ge=0, le=100000000000)
    kills: int = Field(ge=0)
    bossKills: int = Field(ge=0)
    maxThreat: int = Field(ge=1)

class Run(RunRequest):
    survivalSeconds: float
    score: int
    endedAt: str

class Runs(BaseModel):
    items: list[Run]
    bestScore: int
