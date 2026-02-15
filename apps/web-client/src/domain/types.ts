/**
 * Branded types to "Wrap Primitives" strictly.
 * This prevents logic errors like passing a SpellId where a CombatantId is expected.
 */

export type SpellId = string & { readonly __brand: "SpellId" };
export type CombatantId = string & { readonly __brand: "CombatantId" };
export type SessionId = string & { readonly __brand: "SessionId" };
export type CharacterId = string & { readonly __brand: "CharacterId" };

export function asSpellId(id: string): SpellId {
    return id as SpellId;
}

export function asCombatantId(id: string): CombatantId {
    return id as CombatantId;
}

export function asSessionId(id: string): SessionId {
    return id as SessionId;
}

export function asCharacterId(id: string): CharacterId {
    return id as CharacterId;
}
