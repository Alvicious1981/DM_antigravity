import { Database } from "bun:sqlite";
const db = new Database("packages/engine/game.db");
const query = db.query("SELECT id FROM srd_mechanic WHERE id LIKE $term");
const terms = ["%longsword%", "%leather%armor%", "%goblin%", "%ring%protection%", "%fireball%", "%poison%"];

for (const term of terms) {
    const results = query.all({ $term: term });
    console.log(`Results for ${term}:`, results);
}
