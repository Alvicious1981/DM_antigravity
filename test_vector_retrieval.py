
import asyncio
from packages.engine.src.engine.ai.memory import MemoryService

async def test_memory():
    print("🧪 Testing Semantic Memory...")
    ms = MemoryService()
    
    # 1. Store a specific memory
    test_content = "The players met an old gnome named Zifnab in the Whispering Woods. He warned them about a green dragon named Venom."
    print(f"📥 Storing memory: '{test_content}'")
    ms.store_memory(test_content, metadata={"session": "test_01", "location": "Whispering Woods"})
    
    # Wait a bit for indexing
    await asyncio.sleep(2)
    
    # 2. Retrieve using a semantic query
    query = "green dragon"
    print(f"🔍 Searching for: '{query}'")
    results = ms.retrieve_similar_memories(query, limit=2)
    
    if results:
        print(f"✅ Found {len(results)} results!")
        for r in results:
            print(f"  - [{r['similarity']:.2f}] {r['content']}")
    else:
        print("❌ No similar memories found.")

if __name__ == "__main__":
    asyncio.run(test_memory())
