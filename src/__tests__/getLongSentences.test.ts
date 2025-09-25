import LongSentenceHighlighterPlugin from "../main";

let plugin: LongSentenceHighlighterPlugin;

describe("getLongSentences", () => {
	beforeEach(() => {
		plugin = new LongSentenceHighlighterPlugin({} as never, {} as never);
		plugin.settings = {
			maxWords: 10,
			highlightColor: '#ffeb3b',
			enabled: true,
			highlightStyle: 'background'
		};
	});
	test("should identify long sentence", () => {
		const content = "This is a very long sentence that is far beyond the limit of the 10 words that commonly people want to read.";
		const result = plugin.getLongSentences(content);
		expect(result).toHaveLength(1);
	})
	test("should ignore short sentence", () => {
		const content = "This is a short sentence.";
		const result = plugin.getLongSentences(content);
		expect(result).toHaveLength(0);
	})
	test("should ignore multiple short sentences", () => {
		const content = "This is a short sentence. This too. This is a short sentence.";
		const result = plugin.getLongSentences(content);
		expect(result).toHaveLength(0);
	})
	test("should handle bullet points gracefully", () => {
		const content = "This is a short sentence. This too. This is a short sentence.";
		const result = plugin.getLongSentences(content);
		expect(result).toHaveLength(0);
	})
})
