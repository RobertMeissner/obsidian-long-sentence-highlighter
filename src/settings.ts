import {App, PluginSettingTab, Setting} from 'obsidian';
import LongSentenceHighlighterPlugin from './main';

export interface LongSentenceHighlighterSettings {
	maxWords: number;
	highlightColor: string;
	enabled: boolean;
	highlightStyle: 'background' | 'underline';
}

export const DEFAULT_SETTINGS: LongSentenceHighlighterSettings = {
	maxWords: 20,
	highlightColor: '#ffeb3b',
	enabled: true,
	highlightStyle: 'background',
};

export class LongSentenceHighlighterSettingTab extends PluginSettingTab {
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
