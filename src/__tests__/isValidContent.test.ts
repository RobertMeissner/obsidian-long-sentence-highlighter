import LongSentenceHighlighterPlugin from '../main';

let plugin: LongSentenceHighlighterPlugin;

describe('isValidContent', () => {
	beforeEach(() => {
		plugin = new LongSentenceHighlighterPlugin({} as never, {} as never);
		plugin.settings = {
			maxWords: 10,
			highlightColor: '#ffeb3b',
			enabled: true,
			highlightStyle: 'background',
		};
	});
	test('should be false, if empty', () => {
		const content = '';
		expect(plugin.isValidContent(content)).toBe(false);
	});
	test('should be false, if only whitespace', () => {
		const content = '	   ';
		expect(plugin.isValidContent(content)).toBe(false);
	});
	test('should be true, if non-empty and not only whitespace', () => {
		const content = 'test';
		expect(plugin.isValidContent(content)).toBe(true);
	});
});
