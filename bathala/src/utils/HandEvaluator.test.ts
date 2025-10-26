import { HandEvaluator } from "./HandEvaluator";
import { PlayingCard } from "../core/types/CombatTypes";

describe("HandEvaluator", () => {
	let idCounter = 0;

	afterEach(() => {
		idCounter = 0;
	});

	it("detects a straight when Ace acts as the lowest card", () => {
			const hand = createHand([
				{ rank: "1", suit: "Apoy" },
				{ rank: "2", suit: "Tubig" },
				{ rank: "3", suit: "Lupa" },
				{ rank: "4", suit: "Hangin" },
				{ rank: "5", suit: "Apoy" },
		]);

		const result = HandEvaluator.evaluateHand(hand, "attack");

		expect(result.type).toBe("straight");
		expect(result.baseValue).toBeGreaterThan(0);
	});

	it("detects a straight when Ace acts as the highest card", () => {
			const hand = createHand([
				{ rank: "10", suit: "Apoy" },
				{ rank: "Mandirigma", suit: "Tubig" },
				{ rank: "Babaylan", suit: "Lupa" },
				{ rank: "Datu", suit: "Hangin" },
				{ rank: "1", suit: "Apoy" },
		]);

		const result = HandEvaluator.evaluateHand(hand, "attack");

		expect(result.type).toBe("straight");
	});

	it("identifies a royal flush when Ace high straight and flush align", () => {
		const hand = createHand([
			{ rank: "10", suit: "Apoy" },
			{ rank: "Mandirigma", suit: "Apoy" },
			{ rank: "Babaylan", suit: "Apoy" },
			{ rank: "Datu", suit: "Apoy" },
			{ rank: "1", suit: "Apoy" },
		]);

		const result = HandEvaluator.evaluateHand(hand, "special");

		expect(result.type).toBe("royal_flush");
		expect(result.baseValue).toBe(32); // 10(6) + J(6) + Q(7) + K(7) + A(6) = 32
		expect(result.description).toContain("Royal Flush");
	});

	it("does not treat non-consecutive Ace hands as straights", () => {
			const hand = createHand([
				{ rank: "1", suit: "Apoy" },
				{ rank: "3", suit: "Tubig" },
				{ rank: "4", suit: "Lupa" },
				{ rank: "5", suit: "Hangin" },
				{ rank: "6", suit: "Apoy" },
		]);

		const result = HandEvaluator.evaluateHand(hand, "attack");

		expect(result.type).toBe("high_card");
	});

	it("upgrades the evaluated hand when Babaylan's Talisman is owned", () => {
		const player = createPlayerWithRelics(["babaylans_talisman"]);
			const hand = createHand([
				{ rank: "4", suit: "Apoy" },
				{ rank: "4", suit: "Tubig" },
				{ rank: "8", suit: "Lupa" },
				{ rank: "9", suit: "Hangin" },
				{ rank: "10", suit: "Apoy" },
		]);

		const result = HandEvaluator.evaluateHand(hand, "defend", player);

		expect(result.type).toBe("two_pair");
	});

	it("recognises five of a kind only when Diwata's Crown is equipped", () => {
		const cards = createHand([
			{ rank: "7" },
			{ rank: "7" },
			{ rank: "7" },
			{ rank: "7" },
			{ rank: "7" },
		]);

		const withoutRelic = HandEvaluator.evaluateHand(cards, "attack");
		const withRelic = HandEvaluator.evaluateHand(
			cards,
			"attack",
			createPlayerWithRelics(["diwatas_crown"])
		);

		expect(withoutRelic.type).toBe("four_of_a_kind");
		expect(withRelic.type).toBe("five_of_a_kind");
	});

	it("returns zero values when evaluating an empty hand", () => {
		const result = HandEvaluator.evaluateHand([], "attack");

		expect(result.type).toBe("high_card");
		expect(result.baseValue).toBe(0);
		expect(result.totalValue).toBe(0);
	});

	function createHand(
		cards: Array<Partial<PlayingCard> & { rank: PlayingCard["rank"] }>
	): PlayingCard[] {
		return cards.map((card) => ({
			id: `card-${idCounter++}`,
			rank: card.rank,
			suit: card.suit ?? "Apoy",
			element: card.element ?? "fire",
			selected: false,
			playable: true,
		}));
	}

	function createPlayerWithRelics(relicIds: string[]): any {
		return {
			relics: relicIds.map((id) => ({ id })),
			statusEffects: [], // Required for DamageCalculator.calculate
		};
	}
});