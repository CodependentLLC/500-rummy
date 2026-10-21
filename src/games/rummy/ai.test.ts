import { describe, expect, it } from "vitest";
import { bestAiMelds, chooseAiDiscard } from "./ai";
import type { Card, Rank, Suit } from "../../types/rummy";

const card = (rank: Rank, suit: Suit): Card => ({ id: `${rank}${suit}`, rank, suit });

describe("500 Rummy computer difficulty", () => {
  it("makes easy discard low cards while normal sheds higher unmatched cards", () => {
    const hand = [card("K", "♠"), card("4", "♣"), card("A", "♥")];

    expect(chooseAiDiscard(hand, "easy")?.id).toBe("4♣");
    expect(chooseAiDiscard(hand, "normal")?.id).toBe("A♥");
  });

  it("hard optimizes multiple non-overlapping melds", () => {
    const hand = [
      card("3", "♣"), card("4", "♣"), card("5", "♣"),
      card("7", "♠"), card("7", "♥"), card("7", "♦"),
      card("K", "♠")
    ];
    expect(bestAiMelds(hand).map((group) => group.length).sort()).toEqual([3, 3]);
  });

  it("uses only its own hand to protect potential melds on hard", () => {
    const hand = [card("K", "♠"), card("4", "♣"), card("5", "♣"), card("9", "♦")];
    expect(chooseAiDiscard(hand, "hard")?.id).toBe("K♠");
  });
});
