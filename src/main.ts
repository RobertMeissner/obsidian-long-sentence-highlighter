import {App, MarkdownView, Plugin, PluginSettingTab, Setting, Notice} from 'obsidian';
import {EditorView} from '@codemirror/view';
import {StateEffect, StateField} from '@codemirror/state';
import {Decoration, DecorationSet} from '@codemirror/view';

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
	highlightStyle: 'background',
};

const addHighlightEffect = StateEffect.define<{from: number; to: number; style: 'background' | 'underline'}>();
const clearHighlightsEffect = StateEffect.define();

const highlightField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(highlights, tr) {
		highlights = highlights.map(tr.changes);
		for (const e of tr.effects) {
			if (e.is(addHighlightEffect)) {
				const mark = e.value.style === 'underline' ? underlineMark : highlightMark;
				highlights = highlights.update({
					add: [mark.range(e.value.from, e.value.to)],
				});
			} else if (e.is(clearHighlightsEffect)) {
				highlights = Decoration.none;
			}
		}
		return highlights;
	},
	provide: f => EditorView.decorations.from(f),
});

const highlightMark = Decoration.mark({
	class: 'long-sentence-highlight',
});

const underlineMark = Decoration.mark({
	class: 'long-sentence-underline',
});

export default class LongSentenceHighlighterPlugin extends Plugin {
	settings: LongSentenceHighlighterSettings;
	themeObserver: MutationObserver;

	private getCodeMirrorEditor(view: MarkdownView): EditorView | null {
		try {
			// Type-safe access to CodeMirror editor
			const editor = view.editor as unknown;
			if (editor && typeof editor === 'object' && 'cm' in editor) {
				const cm = (editor as {cm: unknown}).cm;
				if (cm instanceof EditorView) {
					return cm;
				}
			}
			return null;
		} catch (error) {
			console.warn('Long Sentence Highlighter: Could not access CodeMirror editor:', error);
			return null;
		}
	}

	async onload() {
		await this.loadSettings();

		this.registerEditorExtension(highlightField);

		this.addCommand({
			id: 'toggle-long-sentence-highlighting',
			name: 'Toggle',
			callback: () => {
				try {
					this.settings.enabled = !this.settings.enabled;
					this.saveSettings();
					if (this.settings.enabled) {
						this.highlightLongSentences();
						new Notice('Highlighting enabled');
					} else {
						this.clearHighlights();
						new Notice('Highlighting disabled');
					}
				} catch (error) {
					console.error('Long Sentence Highlighter: Error toggling highlighting:', error);
					new Notice('Error toggling highlighting');
				}
			},
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
			},
		});

		this.addCommand({
			id: 'clear-sentence-highlights',
			name: 'Clear highlights',
			callback: () => {
				try {
					this.clearHighlights();
				} catch (error) {
					console.error('Long Sentence Highlighter: Error clearing highlights:', error);
					new Notice('Error clearing highlights');
				}
			},
		});

		this.addSettingTab(new LongSentenceHighlighterSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				if (this.settings.enabled) {
					setTimeout(() => this.highlightLongSentences(), 500);
				}
			})
		);

		// Listen for theme changes to update colors
		this.registerEvent(
			this.app.workspace.on('css-change', () => {
				if (this.settings.enabled) {
					setTimeout(() => {
						this.applyCustomCSS();
						this.highlightLongSentences();
					}, 100);
				}
			})
		);

		// Set up theme change observer
		this.setupThemeObserver();

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

			// Disconnect theme observer
			if (this.themeObserver) {
				this.themeObserver.disconnect();
			}
		} catch (error) {
			console.error('Long Sentence Highlighter: Error during unload:', error);
		}
	}

	setupThemeObserver() {
		// Observe changes to the body class list to detect theme changes
		this.themeObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					if (this.settings.enabled) {
						setTimeout(() => {
							this.applyCustomCSS();
							this.highlightLongSentences();
						}, 50);
					}
				}
			});
		});

		this.themeObserver.observe(document.body, {
			attributes: true,
			attributeFilter: ['class'],
		});
	}

	highlightLongSentences(cm6Editor?: EditorView) {
		try {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) {
				return;
			}

			if (!cm6Editor) {
				const editor = this.getCodeMirrorEditor(activeView);
				if (!editor) {
					console.warn('Long Sentence Highlighter: Could not access CodeMirror editor');
					return;
				}
				cm6Editor = editor;
			}

			this.applyCustomCSS();

			const content = cm6Editor.state.doc.toString();
			const sentences = this.getLongSentences(content);

			const effects: StateEffect<unknown>[] = [clearHighlightsEffect.of(null)];

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

	protected isValidContent(content: string): boolean {
		return !!content?.trim();
	}

	private wordCount(sentence: string): number {
		return sentence
			.trim()
			.split(/\s+/)
			.filter(word => word.length > 0).length;
	}

	private splitIntoSentences(content: string): string[] {
		const sentencePattern = /([.!?])\s+/g;
		const paragraphBreaks = /\n\s*\n+/g;
		return content
			.replace(sentencePattern, '$1\n')
			.replace(paragraphBreaks, '\n')
			.split('\n')
			.filter(sentence => sentence.trim().length > 0)
			.map(sentence => sentence.trim());
	}

	getLongSentences(content: string): string[] {
		let sentences: string[] = [];
		try {
			if (this.isValidContent(content)) {
				sentences = this.splitIntoSentences(content).filter(
					sentence => this.wordCount(sentence) > this.settings.maxWords
				);
			}
		} catch (error) {
			console.error('Long Sentence Highlighter: Error in getLongSentences:', error);
		}
		return sentences;
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

			// Detect if we're in dark mode
			const isDarkMode = document.body.classList.contains('theme-dark');

			// Adjust colors for dark mode
			let backgroundHighlightColor = this.settings.highlightColor;
			const underlineColor = this.settings.highlightColor;

			if (isDarkMode) {
				// Convert hex color to rgba with reduced opacity for dark mode
				const hexToRgba = (hex: string, alpha: number) => {
					const r = parseInt(hex.slice(1, 3), 16);
					const g = parseInt(hex.slice(3, 5), 16);
					const b = parseInt(hex.slice(5, 7), 16);
					return `rgba(${r}, ${g}, ${b}, ${alpha})`;
				};

				// Use lower opacity for background in dark mode
				if (this.settings.highlightColor.startsWith('#')) {
					backgroundHighlightColor = hexToRgba(this.settings.highlightColor, 0.3);
				} else {
					// If it's already rgba or other format, use as is
					backgroundHighlightColor = this.settings.highlightColor;
				}
			}

			style.textContent = `
				.cm-line .long-sentence-highlight {
					background-color: ${backgroundHighlightColor};
					border-radius: 2px;
					padding: 1px 0;
					transition: background-color 0.2s ease;
				}
				.cm-line .long-sentence-underline {
					text-decoration: underline;
					text-decoration-color: ${underlineColor};
					text-decoration-thickness: 2px;
					text-underline-offset: 2px;
					transition: text-decoration-color 0.2s ease;
				}
				.theme-dark .cm-line .long-sentence-highlight {
					background-color: ${backgroundHighlightColor};
					border-radius: 2px;
					padding: 1px 0;
					transition: background-color 0.2s ease;
				}
				.theme-dark .cm-line .long-sentence-underline {
					text-decoration: underline;
					text-decoration-color: ${underlineColor};
					text-decoration-thickness: 2px;
					text-underline-offset: 2px;
					transition: text-decoration-color 0.2s ease;
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

			const cm6Editor = this.getCodeMirrorEditor(activeView);
			if (!cm6Editor) return;

			cm6Editor.dispatch({
				effects: [clearHighlightsEffect.of(null)],
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
			.addText(text =>
				text
					.setPlaceholder('20')
					.setValue(this.plugin.settings.maxWords.toString())
					.onChange(async value => {
						const threshold = parseInt(value);
						if (!isNaN(threshold) && threshold > 0) {
							this.plugin.settings.maxWords = threshold;
							await this.plugin.saveSettings();
							if (this.plugin.settings.enabled) {
								this.plugin.highlightLongSentences();
							}
						}
					})
			);

		new Setting(containerEl)
			.setName('Highlight style')
			.setDesc('Choose how to highlight long sentences')
			.addDropdown(dropdown =>
				dropdown
					.addOption('background', 'Background highlight')
					.addOption('underline', 'Underline')
					.setValue(this.plugin.settings.highlightStyle)
					.onChange(async (value: 'background' | 'underline') => {
						this.plugin.settings.highlightStyle = value;
						await this.plugin.saveSettings();
						if (this.plugin.settings.enabled) {
							this.plugin.highlightLongSentences();
						}
					})
			);

		new Setting(containerEl)
			.setName('Highlight color')
			.setDesc('Color used to highlight long sentences')
			.addColorPicker(colorPicker =>
				colorPicker.setValue(this.plugin.settings.highlightColor).onChange(async value => {
					this.plugin.settings.highlightColor = value;
					await this.plugin.saveSettings();
					if (this.plugin.settings.enabled) {
						this.plugin.highlightLongSentences();
					}
				})
			);

		new Setting(containerEl)
			.setName('Enable highlighting')
			.setDesc('Automatically highlight long sentences')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.enabled).onChange(async value => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
					if (value) {
						this.plugin.highlightLongSentences();
					} else {
						this.plugin.clearHighlights();
					}
				})
			);
	}
}
