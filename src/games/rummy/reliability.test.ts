import { describe, expect, it } from "vitest";
import { createGame, discardSelected, drawStock, pickupDiscardAt, playSelectedMeld, layOff } from "./engine";
import { runAiTurn } from "./ai";
import type { Card } from "../../types/rummy";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ id: rank + suit, rank, suit });
const initial = () => createGame(2, [{ avatarId: "ava-01", name: "Human" }, { avatarId: "ava-02", name: "CPU" }]);

describe("gameplay reliability regressions", () => {
  it("blocks meld, layoff, and discard before drawing", () => {
    const base = initial();
    const state = { ...base, selected: ["A♠", "A♥", "A♦"], players: base.players.map((p, i) => i ? p : { ...p, hand: [card("A","♠"), card("A","♥"), card("A","♦")] }) };
    expect(playSelectedMeld(state)).toBe(state);
    expect(discardSelected({ ...state, selected: ["A♠"] })).toMatchObject({ drawn: false, turn: 0 });
    expect(layOff(state, "missing")).toBe(state);
  });

  it("requires the discard pickup card to be played before discarding", () => {
    const base = initial();
    const state = { ...base, discard: [card("7","♠")], players: base.players.map((p, i) => i ? p : { ...p, hand: [card("7","♥"), card("7","♦"), card("K","♣")], melds: [] }) };
    const picked = pickupDiscardAt(state, 0);
    expect(picked.requiredPickupCardId).toBe("7♠");
    const attempted = discardSelected({ ...picked, selected: ["K♣"] });
    expect(attempted.players[0].hand).toHaveLength(4);
    expect(attempted.message).toContain("picked-up discard");
    const melded = playSelectedMeld({ ...picked, selected: ["7♠", "7♥", "7♦"] });
    expect(melded.requiredPickupCardId).toBeUndefined();
    expect(discardSelected({ ...melded, selected: ["K♣"] }).handOver).toBe(true);
  });

  it("finishes a round when drawing from empty stock", () => {
    const state = { ...initial(), stock: [] };
    expect(drawStock(state).handOver).toBe(true);
  });

  it("finishes a round when an AI faces empty stock", () => {
    const state = { ...initial(), stock: [], turn: 1 };
    expect(runAiTurn(state).handOver).toBe(true);
  });
});
