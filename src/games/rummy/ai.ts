import { cardValue, canLay, meldType, possibleMelds, rankValue, removeCards, sortCards } from "./rules";
import { immediatelyUsable, scoreHand, tableMelds } from "./engine";
import type { Card, ComputerDifficulty, GameState } from "../../types/rummy";

function connectionScore(card: Card, hand: Card[]) {
  return hand.reduce((score, candidate) => {
    if (candidate.id === card.id) return score;
    if (candidate.rank === card.rank) return score + 3;
    if (candidate.suit !== card.suit) return score;
    const distance = Math.abs(rankValue(candidate.rank) - rankValue(card.rank));
    return score + (distance === 1 ? 3 : distance === 2 ? 1 : 0);
  }, 0);
}



export function chooseAiDiscard(hand: Card[], difficulty: ComputerDifficulty, state?: GameState) {
  if (difficulty === "easy") return [...hand].sort((left, right) => cardValue(left) - cardValue(right))[0];
  if (difficulty === "normal") return [...hand].sort((left, right) => (cardValue(right) - connectionScore(right, hand) * 2) - (cardValue(left) - connectionScore(left, hand) * 2))[0];
  return [...hand].sort((left, right) => {
    const leftPriority = cardValue(left) * 2 - connectionScore(left, hand) * 5 - (state ? visibleRisk(left, state) * 2 : 0);
    const rightPriority = cardValue(right) * 2 - connectionScore(right, hand) * 5 - (state ? visibleRisk(right, state) * 2 : 0);
    return rightPriority - leftPriority;
  })[0];
}

/** Maximize immediately banked meld points rather than greedily taking one meld. */
export function bestAiMelds(hand: Card[]): Card[][] {
  const memo = new Map<string, { points: number; groups: Card[][] }>();
  const solve = (cards: Card[]): { points: number; groups: Card[][] } => {
    const key = cards.map((card) => card.id).sort().join("|");
    const cached = memo.get(key);
    if (cached) return cached;
    let best = { points: 0, groups: [] as Card[][] };
    for (const group of possibleMelds(cards)) {
      const remaining = solve(removeCards(cards, group.map((card) => card.id)));
      const value = group.reduce((sum, card) => sum + cardValue(card), 0) + remaining.points;
      if (value > best.points) best = { points: value, groups: [group, ...remaining.groups] };
    }
    memo.set(key, best);
    return best;
  };
  return solve(hand).groups;
}

function visibleRisk(card: Card, state: GameState) {
  // Only public information: discards and table melds, never a human hand.
  const publicCards = [...state.discard, ...tableMelds(state).flatMap((meld) => meld.cards)];
  const publicRankCount = publicCards.filter((candidate) => candidate.rank === card.rank).length;
  const knownAdjacent = publicCards.filter((candidate) => candidate.suit === card.suit && Math.abs(rankValue(candidate.rank) - rankValue(card.rank)) <= 2).length;
  return publicRankCount * 2 + knownAdjacent;
}

function drawForAi(state: GameState, hand: Card[], stock: Card[], discard: Card[]) {
  if (state.difficulty === "hard") {
    const topDiscard = discard.at(-1);
    if (topDiscard && immediatelyUsable(topDiscard, hand, tableMelds(state), [topDiscard])) {
      discard.pop();
      return sortCards([...hand, topDiscard]);
    }
  }
  return stock.length ? sortCards([...hand, stock.pop()!]) : hand;
}

function shouldLayOff(difficulty: ComputerDifficulty, stockLength: number) {
  return difficulty !== "easy" || stockLength % 4 === 0;
}

export function runAiTurn(state: GameState): GameState {
  if (state.turn === 0 || state.handOver) return state;
  if (!state.stock.length) return scoreHand({ ...state, message: "Stock exhausted. Hand complete." });
  const players = state.players.map((player) => ({ ...player, hand: [...player.hand], melds: player.melds.map((meld) => ({ ...meld, cards: [...meld.cards] })) }));
  const stock = [...state.stock];
  const discard = [...state.discard];
  const ai = players[state.turn];
  ai.hand = drawForAi(state, ai.hand, stock, discard);
  const plannedMelds = state.difficulty === "hard" ? bestAiMelds(ai.hand) : state.difficulty === "normal" ? [possibleMelds(ai.hand)[0]].filter((group): group is Card[] => Boolean(group)) : (stock.length % 3 === 0 ? [possibleMelds(ai.hand)[0]].filter((group): group is Card[] => Boolean(group)) : []);
  for (const group of plannedMelds) {
    if (!group.every((card) => ai.hand.some((held) => held.id === card.id))) continue;
    ai.hand = removeCards(ai.hand, group.map((card) => card.id));
    ai.melds.push({ id: crypto.randomUUID(), type: meldType(group)!, cards: sortCards(group) });
  }
  for (const card of shouldLayOff(state.difficulty, stock.length) ? [...ai.hand] : []) {
    const target = tableMelds({ ...state, players }).find((meld) => canLay(card, meld));
    if (target) {
      ai.hand = removeCards(ai.hand, [card.id]);
      target.cards = sortCards([...target.cards, card]);
    }
  }
  let next = { ...state, players, stock, discard };
  if (!ai.hand.length) return scoreHand(next);
  const outgoing = chooseAiDiscard(ai.hand, state.difficulty, { ...state, players, discard });
  ai.hand = removeCards(ai.hand, [outgoing.id]);
  next = { ...next, discard: [...discard, outgoing] };
  if (!ai.hand.length) return scoreHand(next);
  return { ...next, turn: (state.turn + 1) % players.length, drawn: false, message: `${ai.name} discarded ${outgoing.rank}${outgoing.suit}.` };
}
