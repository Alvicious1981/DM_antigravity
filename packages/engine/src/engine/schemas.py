from pydantic import BaseModel, Field
from typing import Optional, List, Any, Union, Literal

# --- Shared Models ---

# --- Shared Models ---

class CombatantState(BaseModel):
    id: str
    name: str
    initiative: int
    active: bool
    hp: int
    hp_max: int
    ac: int
    cr: Union[float, str] = 0

    type: str = "unknown"
    conditions: List[str] = []
    resistances: List[str] = []
    immunities: List[str] = []
    current: bool = False
    position: Optional[Union[int, str]] = None



class SaveInfo(BaseModel):
    save_id: str
    created_at: str
    character_name: Optional[str] = "Unknown"
    character_class: Optional[str] = "Adventurer"
    level: int = 1
    location: Optional[str] = "Unknown Lands"


class CharacterCreationRequest(BaseModel):
    name: str
    class_id: str  # e.g. "class_fighter"
    background_id: str  # e.g. "bg_soldier"
    race_id: Optional[str] = None  # e.g. "drow", "human"
    stats: Optional[dict] = None  # {str: 16, dex: 12...} - if None, rolled server-side


class GameSession(BaseModel):
    save_id: str
    character: CombatantState
    location: str = "Unknown Lands"
    scene: str = "Prologue"


class InventoryItemModel(BaseModel):
    instance_id: str
    template_id: str
    name: str
    location: str
    slot_type: Optional[str]
    grid_index: Optional[int] = None
    charges: int
    stats: dict
    visual_asset_url: Optional[str] = None
    rarity: str = "Common"
    attunement: bool = False


# --- Incoming Action Payloads ---

class BaseAction(BaseModel):
    pass

class GetInventoryAction(BaseAction):
    action: Literal["get_inventory"]
    character_id: str = "player"

class GenerateLootAction(BaseAction):
    action: Literal["generate_loot"]
    cr: int = 1
    target_character_id: Optional[str] = None


class SearchMonstersAction(BaseAction):
    action: Literal["search_monsters"]
    query: str

class AddCombatantAction(BaseAction):
    action: Literal["add_combatant"]
    instance_id: str
    template_id: Optional[str] = None
    name: str = "Unknown"
    is_player: bool = False
    hp_max: int = 10
    ac: int = 10
    cr: float = 0
    type: str = "unknown"
    resistances: List[str] = []
    immunities: List[str] = []

class EquipItemAction(BaseAction):
    action: Literal["equip_item"]
    character_id: str = "player"
    item_id: str
    slot: str = "main_hand"

class UnequipItemAction(BaseAction):
    action: Literal["unequip_item"]
    character_id: str = "player"
    item_id: str

class AttackAction(BaseAction):
    action: Literal["attack"]
    attacker_id: str = "player"
    target_id: str = "enemy"
    action_name: Optional[str] = None
    weapon_id: Optional[str] = None
    # CRITICAL: Overrides removed for security (§ STRIDE-T1)

class MonsterAttackAction(BaseAction):
    action: Literal["monster_attack"]
    attacker_id: str
    target_id: str
    action_index: int = 0
    target_ac: int = 10
    target_current_hp: int = 10

class CastSpellAction(BaseAction):
    action: Literal["cast_spell"]
    spell_id: str  # Required to fetch from registry
    attacker_id: str = "player"
    target_id: str = "enemy"
    target_ids: Optional[List[str]] = None
    condition: Optional[str] = None
    is_save: bool = False
    # CRITICAL: Overrides removed for security (§ STRIDE-T1)



class RollInitiativeAction(BaseAction):
    action: Literal["roll_initiative"]
    combatant_id: str = "player"
    name: str = "Player"
    dex_modifier: int = 0
    is_player: bool = False

class StartCombatAction(BaseAction):
    action: Literal["start_combat"]

class NextTurnAction(BaseAction):
    action: Literal["next_turn"]

class RollAction(BaseAction):
    action: Literal["roll"]
    sides: int = 20
    count: int = 1
    modifier: int = 0


class GetSpellsAction(BaseAction):
    action: Literal["get_spells"]
    character_id: str


class DistributeLootAction(BaseAction):
    action: Literal["distribute_loot"]
    item_ids: List[str]
    target_character_id: str

class CloseWidgetAction(BaseAction):
    action: Literal["close_widget"]
    widget_id: str

class MapInteractionAction(BaseAction):
    action: Literal["map_interaction"]
    character_id: str
    target_node_id: Optional[str] = None
    cell_id: Optional[int] = None
    interaction_type: str = "travel" # travel, inspect, etc.


class NarrativeActionAction(BaseAction):
    action: Literal["narrative_action"]
    content: str  # Free-form player intent, routed to Chronos


class SaveGameAction(BaseAction):
    action: Literal["save_game"]
    save_id: str = "default"


class LoadGameAction(BaseAction):
    action: Literal["load_game"]
    save_id: str = "default"

class ListSavesAction(BaseAction):
    action: Literal["list_saves"]

class GetShopAction(BaseAction):
    action: Literal["get_shop"]
    node_id: str
    character_id: str = "player_1"


# Union type for validation
GameAction = Union[
    GetInventoryAction,
    GenerateLootAction,
    SearchMonstersAction,
    AddCombatantAction,
    EquipItemAction,
    UnequipItemAction,
    AttackAction,
    MonsterAttackAction,
    CastSpellAction,
    RollInitiativeAction,
    StartCombatAction,
    NextTurnAction,
    RollAction,
    GetSpellsAction,
    DistributeLootAction,
    MapInteractionAction,
    NarrativeActionAction,
    SaveGameAction,
    LoadGameAction,
    ListSavesAction,
    GetShopAction,
]


# --- Outgoing Events ---

class BaseEvent(BaseModel):
    pass

class ConnectionEstablishedEvent(BaseEvent):
    type: Literal["CONNECTION_ESTABLISHED"]
    session_id: str
    character_id: str
    role: str = "player"  # "dm" or "player"
    message: str

class InventoryUpdateEvent(BaseEvent):
    type: Literal["INVENTORY_UPDATE"]
    character_id: str
    items: List[InventoryItemModel]

class NarrativeChunkEvent(BaseEvent):
    type: Literal["NARRATIVE_CHUNK"]
    content: str
    index: int
    done: bool

class NarrativeEvent(BaseEvent):
    type: Literal["NARRATIVE_EVENT"] = "NARRATIVE_EVENT"
    content: str
    event_type: str = "travel" # travel, discovery, encounter
    metadata: Optional[dict] = None

class MonsterSearchResultsEvent(BaseEvent):
    type: Literal["MONSTER_SEARCH_RESULTS"]
    results: List[dict]

class InitiativeUpdateEvent(BaseEvent):
    type: Literal["INITIATIVE_UPDATE"]
    combatants: List[CombatantState]

class StatePatchEvent(BaseEvent):
    type: Literal["STATE_PATCH"]
    patches: List[dict] # JSON Patch
    fact_packet: Optional[dict] = None

class DiceResultEvent(BaseEvent):
    type: Literal["DICE_RESULT"]
    notation: str
    rolls: List[int]
    total: int

class AckEvent(BaseEvent):
    type: Literal["ACK"]
    status: str = "ok" # ok, error
    action_id: Optional[str] = None
    message: Optional[str] = None

class LogEvent(BaseEvent):
    type: Literal["LOG"]
    message: str
    level: Literal["info", "warning", "error", "success"] = "info"


from .maps import MapNode

class MapDataEvent(BaseEvent):
    type: Literal["MAP_DATA"] = "MAP_DATA"
    nodes: List[MapNode]
    current_node_id: str


class SpellData(BaseModel):
    id: str
    name: str
    level: int
    school: str
    casting_time: str
    range: str
    components: str
    duration: str
    description: str
    is_attack: bool
    is_save: bool
    save_stat: Optional[str]
    damage_dice_sides: int
    damage_dice_count: int
    damage_type: str
    aoe_radius: int
    name_es: Optional[str] = None
    description_es: Optional[str] = None


class SpellBookUpdateEvent(BaseEvent):
    type: Literal["SPELL_BOOK_UPDATE"] = "SPELL_BOOK_UPDATE"
    character_id: str
    spells: List[SpellData]


class LootDistributedEvent(BaseEvent):
    type: Literal["LOOT_DISTRIBUTED"] = "LOOT_DISTRIBUTED"
    character_id: str
    items: List[InventoryItemModel]
    message: str


class MapUpdateEvent(BaseEvent):
    type: Literal["MAP_UPDATE"] = "MAP_UPDATE"
    character_id: str
    cell_id: Optional[int] = None
    node_id: Optional[str] = None
    interaction_type: str
    message: Optional[str] = None


class GoldUpdateEvent(BaseEvent):
    type: Literal["GOLD_UPDATE"] = "GOLD_UPDATE"
    character_id: str
    gold: int   # new total
    delta: int  # amount added this transaction


class ShopItemModel(BaseModel):
    rarity: str
    buy_price: int


class ShopInventoryEvent(BaseEvent):
    type: Literal["SHOP_INVENTORY"] = "SHOP_INVENTORY"
    node_id: str
    node_type: str
    has_shop: bool
    items: List[ShopItemModel]
