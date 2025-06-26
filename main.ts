import { App, MarkdownView, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { EditorView } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet } from '@codemirror/view';

interface LongSentenceHighlighterSettings {
	maxWords: number;
	highlightColor: string;
	enabled: boolean;
	highlightStyle: 'background' | 'underline';
}

const DEFAULT_SETTINGS: LongSentenceHighlighterSettings = {
	maxWords: 20,
	highlightColor: '#ffeb3b',
	enabled: true,
	highlightStyle: 'background'
}

const addHighlightEffect = StateEffect.define<{from: number, to: number, style: 'background' | 'underline'}>();
const clearHighlightsEffect = StateEffect.define();

const highlightField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(highlights, tr) {
		highlights = highlights.map(tr.changes);
		for (let e of tr.effects) {
			if (e.is(addHighlightEffect)) {
				const mark = e.value.style === 'underline' ? underlineMark : highlightMark;
				highlights = highlights.update({
					add: [mark.range(e.value.from, e.value.to)]
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

const underlineMark = Decoration.mark({
	class: "long-sentence-underline"
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
				try {
					this.settings.enabled = !this.settings.enabled;
					this.saveSettings();
					if (this.settings.enabled) {
						this.highlightLongSentences();
						new Notice('Long sentence highlighting enabled');
					} else {
						this.clearHighlights();
						new Notice('Long sentence highlighting disabled');
					}
				} catch (error) {
					console.error('Long Sentence Highlighter: Error toggling highlighting:', error);
					new Notice('Error toggling highlighting');
				}
			}
		});

		this.addCommand({
			id: 'highlight-long-sentences',
			name: 'Highlight long sentences in current note',
			callback: () => {
				try {
					this.highlightLongSentences();
				} catch (error) {
					console.error('Long Sentence Highlighter: Error highlighting sentences:', error);
					new Notice('Error highlighting sentences');
				}
			}
		});

		this.addCommand({
			id: 'clear-sentence-highlights',
			name: 'Clear sentence highlights',
			callback: () => {
				try {
					this.clearHighlights();
				} catch (error) {
					console.error('Long Sentence Highlighter: Error clearing highlights:', error);
					new Notice('Error clearing highlights');
				}
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
		try {
			this.clearHighlights();
			
			// Remove custom CSS
			const existingStyle = document.getElementById('long-sentence-highlighter-styles');
			if (existingStyle) {
				existingStyle.remove();
			}
		} catch (error) {
			console.error('Long Sentence Highlighter: Error during unload:', error);
		}
	}

	async highlightView(view: MarkdownView) {
		try {
			const cm6Editor: EditorView = (view.editor as any).cm as EditorView;

			if (!cm6Editor) {
				console.warn('Long Sentence Highlighter: Failed to access CodeMirror editor');
				return;
			}

			this.applyCustomCSS();
			this.highlightLongSentences(cm6Editor);
		} catch (error) {
			console.error('Long Sentence Highlighter: Error in highlightView:', error);
		}
	}

	highlightLongSentences(cm6Editor?: EditorView) {
		try {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) {
				return;
			}

			if (!cm6Editor) {
				cm6Editor = (activeView.editor as any).cm as EditorView;
			}

			if (!cm6Editor) {
				console.warn('Long Sentence Highlighter: Could not access CodeMirror editor');
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
					effects.push(addHighlightEffect.of({from, to, style: this.settings.highlightStyle}));
					startIndex = to;
				}
			}

			if (effects.length > 1) {
				cm6Editor.dispatch({effects});
			}
		} catch (error) {
			console.error('Long Sentence Highlighter: Error in highlightLongSentences:', error);
		}
	}

	getLongSentences(content: string): string[] {
		try {
			if (!content || content.trim().length === 0) {
				return [];
			}

			const sentenceDelimiterRegex = /(?<=[.!?])\s+|(?=\n\n)|(?=\n\s*\n)|(?<!\n)\n(?!\n)/;
			const sentences = content.split(sentenceDelimiterRegex);

			return sentences.filter((sentence) => {
				const trimmed = sentence.trim();
				if (trimmed.length === 0) return false;
				
				const wordCount = trimmed.split(/\s+/).filter(word => word.length > 0).length;
				return wordCount > this.settings.maxWords;
			});
		} catch (error) {
			console.error('Long Sentence Highlighter: Error in getLongSentences:', error);
			return [];
		}
	}

	applyCustomCSS() {
		try {
			// Remove existing style if it exists
			const existingStyle = document.getElementById('long-sentence-highlighter-styles');
			if (existingStyle) {
				existingStyle.remove();
			}

			const style = document.createElement('style');
			style.id = 'long-sentence-highlighter-styles';
			style.textContent = `
				.cm-line .long-sentence-highlight {
					background-color: ${this.settings.highlightColor};
					border-radius: 2px;
					padding: 1px 0;
				}
				.cm-line .long-sentence-underline {
					text-decoration: underline;
					text-decoration-color: ${this.settings.highlightColor};
					text-decoration-thickness: 2px;
					text-underline-offset: 2px;
				}
			`;
			document.head.appendChild(style);
		} catch (error) {
			console.error('Long Sentence Highlighter: Error applying CSS:', error);
		}
	}

	clearHighlights() {
		try {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) return;

			const cm6Editor: EditorView = (activeView.editor as any).cm as EditorView;
			if (!cm6Editor) return;

			cm6Editor.dispatch({
				effects: [clearHighlightsEffect.of(null)]
			});
		} catch (error) {
			console.error('Long Sentence Highlighter: Error clearing highlights:', error);
		}
	}

	async loadSettings() {
		try {
			this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		} catch (error) {
			console.error('Long Sentence Highlighter: Error loading settings:', error);
			this.settings = DEFAULT_SETTINGS;
		}
	}

	async saveSettings() {
		try {
			await this.saveData(this.settings);
		} catch (error) {
			console.error('Long Sentence Highlighter: Error saving settings:', error);
		}
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
			.setName('Highlight style')
			.setDesc('Choose how to highlight long sentences')
			.addDropdown(dropdown => dropdown
				.addOption('background', 'Background highlight')
				.addOption('underline', 'Underline')
				.setValue(this.plugin.settings.highlightStyle)
				.onChange(async (value: 'background' | 'underline') => {
					this.plugin.settings.highlightStyle = value;
					await this.plugin.saveSettings();
					if (this.plugin.settings.enabled) {
						this.plugin.highlightLongSentences();
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
