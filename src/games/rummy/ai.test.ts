import { describe, expect, it } from "vitest";
import { chooseAiDiscard } from "./ai";
import type { Card, Rank, Suit } from "../../types/rummy";

const card = (rank: Rank, suit: Suit): Card => ({ id: `${rank}${suit}`, rank, suit });

describe("500 Rummy computer difficulty", () => {
  it("uses the lowest-value discard behavior on easy and normal", () => {
    const hand = [card("K", "♠"), card("4", "♣"), card("A", "♥")];

    expect(chooseAiDiscard(hand, "easy")?.id).toBe("4♣");
    expect(chooseAiDiscard(hand, "normal")?.id).toBe("4♣");
  });

  it("uses only its own hand to protect potential melds on hard", () => {
    const hand = [card("K", "♠"), card("4", "♣"), card("5", "♣"), card("9", "♦")];
    expect(chooseAiDiscard(hand, "hard")?.id).toBe("K♠");
  });
});
