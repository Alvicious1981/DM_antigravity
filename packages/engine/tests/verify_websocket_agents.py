import asyncio
import json
import os
import sys
from unittest.mock import AsyncMock, MagicMock

# Correctly adjust path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from engine.routers.websocket import game_websocket
from engine.schemas import GenerateLootAction

async def verify_loot_flow():
    print("🚀 Starting manual verification of WebSocket AI flow...")
    
    # Mock WebSocket
    websocket = AsyncMock()
    # Mock connection phase
    websocket.receive_json = AsyncMock(side_effect=[
        {"action": "generate_loot", "cr": 5, "character_id": "test_hero", "session_id": "test_session"},
        asyncio.CancelledError() # Stop the loop
    ])
    
    # Capture events sent
    events_sent = []
    async def mock_send_json(data):
        events_sent.append(data)
        print(f"📡 Event Sent: {data.get('type')} - {str(data)[:100]}...")

    websocket.send_json = AsyncMock(side_effect=mock_send_json)
    websocket.accept = AsyncMock()

    try:
        await game_websocket(websocket, "test_session")
    except asyncio.CancelledError:
        pass
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ Error during verification: {e}")

    print("\n📊 Verification Summary:")
    types = [e.get("type") for e in events_sent]
    print(f"Total Events: {len(events_sent)}")
    print(f"Event Types: {set(types)}")
    
    # Check for critical V6 events
    event_types_found = set(types)
    expected_types = {"CONNECTION_ESTABLISHED", "INVENTORY_UPDATE", "SHOW_WIDGET", "NARRATIVE_CHUNK"}
    for t in expected_types:
        if t not in event_types_found:
             print(f"❌ Missing expected event type: {t}")
        else:
             print(f"✅ Found event type: {t}")
    
    # Check for the "done" signal
    narrative_chunks = [e for e in events_sent if e.get("type") == "NARRATIVE_CHUNK"]
    if any(c.get("done") is True for c in narrative_chunks):
         print("✅ Narrative 'done' signal verified.")
    else:
         print("❌ Missing narrative 'done' signal.")
    
    print("\n✅ Verification phase for manual flow complete.")

if __name__ == "__main__":
    asyncio.run(verify_loot_flow())
