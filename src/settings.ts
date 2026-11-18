import {App, PluginSettingTab, SettingDefinitionItem} from 'obsidian';
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

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Word threshold',
				desc: 'Highlight sentences with this many words or more',
				control: {type: 'number', key: 'maxWords', placeholder: '20', min: 1},
			},
			{
				name: 'Highlight style',
				desc: 'Choose how to highlight long sentences',
				control: {
					type: 'dropdown',
					key: 'highlightStyle',
					options: {background: 'Background highlight', underline: 'Underline'},
				},
			},
			{
				name: 'Highlight color',
				desc: 'Color used to highlight long sentences',
				control: {type: 'color', key: 'highlightColor'},
			},
			{
				name: 'Enable highlighting',
				desc: 'Automatically highlight long sentences',
				control: {type: 'toggle', key: 'enabled'},
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		await super.setControlValue(key, value);
		if (key === 'enabled' && !value) {
			this.plugin.clearHighlights();
		} else if (this.plugin.settings.enabled) {
			this.plugin.highlightLongSentences();
		}
	}
}
