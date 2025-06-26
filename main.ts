import { App, MarkdownView, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { EditorView } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet } from '@codemirror/view';

interface LongSentenceHighlighterSettings {
	maxWords: number;
	highlightColor: string;
	enabled: boolean;
}

const DEFAULT_SETTINGS: LongSentenceHighlighterSettings = {
	maxWords: 20,
	highlightColor: '#ffeb3b',
	enabled: true
}

const addHighlightEffect = StateEffect.define<{from: number, to: number}>();
const clearHighlightsEffect = StateEffect.define();

const highlightField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(highlights, tr) {
		highlights = highlights.map(tr.changes);
		for (let e of tr.effects) {
			if (e.is(addHighlightEffect)) {
				highlights = highlights.update({
					add: [highlightMark.range(e.value.from, e.value.to)]
				});
			} else if (e.is(clearHighlightsEffect)) {
				highlights = Decoration.none;
			}
		}
		return highlights;
	},
	provide: f => EditorView.decorations.from(f)
});

const highlightMark = Decoration.mark({
	class: "long-sentence-highlight"
});

export default class LongSentenceHighlighterPlugin extends Plugin {
	settings: LongSentenceHighlighterSettings;

	async onload() {
		await this.loadSettings();

		this.registerEditorExtension(highlightField);

		this.addCommand({
			id: 'toggle-long-sentence-highlighting',
			name: 'Toggle long sentence highlighting',
			callback: () => {
				this.settings.enabled = !this.settings.enabled;
				this.saveSettings();
				if (this.settings.enabled) {
					this.highlightLongSentences();
					new Notice('Long sentence highlighting enabled');
				} else {
					this.clearHighlights();
					new Notice('Long sentence highlighting disabled');
				}
			}
		});

		this.addCommand({
			id: 'highlight-long-sentences',
			name: 'Highlight long sentences in current note',
			callback: () => {
				this.highlightLongSentences();
			}
		});

		this.addCommand({
			id: 'clear-sentence-highlights',
			name: 'Clear sentence highlights',
			callback: () => {
				this.clearHighlights();
			}
		});

		this.addSettingTab(new LongSentenceHighlighterSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				if (this.settings.enabled) {
					setTimeout(() => this.highlightLongSentences(), 500);
				}
			})
		);

		if (this.settings.enabled) {
			setTimeout(() => this.highlightLongSentences(), 1000);
		}
	}

	onunload() {
		this.clearHighlights();
	}

	async highlightView(view: MarkdownView) {
		const cm6Editor: EditorView = (view.editor as any).cm as EditorView;

		if (!cm6Editor) {
			new Notice('Failed to access the CodeMirror editor.');
			console.log('Failed to access the CodeMirror editor.');
			return;
		}

		this.applyCustomCSS();
		this.highlightLongSentences(cm6Editor);
	}

	highlightLongSentences(cm6Editor?: EditorView) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			console.log('Long Sentence Highlighter: No active markdown view');
			return;
		}

		if (!cm6Editor) {
			cm6Editor = (activeView.editor as any).cm as EditorView;
		}

		if (!cm6Editor) {
			console.log('Long Sentence Highlighter: Could not access CodeMirror editor');
			return;
		}

		this.applyCustomCSS();

		const content = cm6Editor.state.doc.toString();
		const sentences = this.getLongSentences(content);

		const effects: StateEffect<any>[] = [clearHighlightsEffect.of(null)];

		let startIndex = 0;
		for (const sentence of sentences) {
			startIndex = content.indexOf(sentence, startIndex);
			if (startIndex !== -1) {
				const from = startIndex;
				const to = from + sentence.length;
				effects.push(addHighlightEffect.of({from, to}));
				startIndex = to;
			} else {
				console.log(`Could not find sentence: ${sentence}`);
			}
		}

		if (effects.length > 1) {
			cm6Editor.dispatch({effects});
		}
	}

	getLongSentences(content: string): string[] {
		const sentenceDelimiterRegex = /(?<=[.!?])\s+|(?=\n\n)|(?=\n\s*\n)|(?<!\n)\n(?!\n)/;
		const sentences = content.split(sentenceDelimiterRegex);

		return sentences.filter((sentence) => sentence.split(/\s+/).length > this.settings.maxWords);
	}

	applyCustomCSS() {
		const style = document.createElement('style');
		style.textContent = `
			.cm-line .long-sentence-highlight {
				background-color: ${this.settings.highlightColor};
			}
		`;
		document.head.append(style);
	}

	clearHighlights() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return;

		const cm6Editor: EditorView = (activeView.editor as any).cm as EditorView;
		if (!cm6Editor) return;

		cm6Editor.dispatch({
			effects: [clearHighlightsEffect.of(null)]
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class LongSentenceHighlighterSettingTab extends PluginSettingTab {
	plugin: LongSentenceHighlighterPlugin;

	constructor(app: App, plugin: LongSentenceHighlighterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Word threshold')
			.setDesc('Highlight sentences with this many words or more')
			.addText(text => text
				.setPlaceholder('20')
				.setValue(this.plugin.settings.maxWords.toString())
				.onChange(async (value) => {
					const threshold = parseInt(value);
					if (!isNaN(threshold) && threshold > 0) {
						this.plugin.settings.maxWords = threshold;
						await this.plugin.saveSettings();
						if (this.plugin.settings.enabled) {
							this.plugin.highlightLongSentences();
						}
					}
				}));

		new Setting(containerEl)
			.setName('Highlight color')
			.setDesc('Color used to highlight long sentences')
			.addColorPicker(colorPicker => colorPicker
				.setValue(this.plugin.settings.highlightColor)
				.onChange(async (value) => {
					this.plugin.settings.highlightColor = value;
					await this.plugin.saveSettings();
					if (this.plugin.settings.enabled) {
						this.plugin.highlightLongSentences();
					}
				}));

		new Setting(containerEl)
			.setName('Enable highlighting')
			.setDesc('Automatically highlight long sentences')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enabled)
				.onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
					if (value) {
						this.plugin.highlightLongSentences();
					} else {
						this.plugin.clearHighlights();
					}
				}));
	}
}
