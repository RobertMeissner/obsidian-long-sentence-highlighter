# Long Sentence Highlighter

[![CI](https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/actions/workflows/ci.yml/badge.svg)](https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/actions/workflows/ci.yml)
[![Release](https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/actions/workflows/release.yml/badge.svg)](https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/github/v/release/RobertMeissner/obsidian-long-sentence-highlighter)](https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/releases)
[![Downloads](https://img.shields.io/github/downloads/RobertMeissner/obsidian-long-sentence-highlighter/total)](https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/releases)

An Obsidian plugin that helps improve writing clarity by highlighting sentences that exceed a configurable word count threshold.

Mainly used by me to have brief sentences in my novel.

## Features

- **Automatic highlighting** of long sentences in both editing and reading modes
- **Configurable word threshold** - set your preferred maximum sentence length
- **Two highlighting styles**:
    - Background highlighting with customizable color
    - Underline highlighting with customizable color
- **Toggle functionality** - easily enable/disable highlighting
- **Real-time updates** - highlights update as you type and navigate between notes

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Long Sentence Highlighter"
4. Install and enable the plugin

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/releases)
2. Extract the files to your vault's `.obsidian/plugins/long-sentence-highlighter/` directory
3. Reload Obsidian and enable the plugin in Settings > Community Plugins

## Usage

### Commands

The plugin provides several commands accessible via the Command Palette (Ctrl/Cmd + P):

- **Toggle long sentence highlighting** - Enable/disable highlighting
- **Highlight long sentences in current note** - Manually trigger highlighting
- **Clear sentence highlights** - Remove all highlights from current note

### Settings

Access plugin settings via Settings > Community Plugins > Long Sentence Highlighter:

- **Word threshold** (default: 20) - Sentences with this many words or more will be highlighted
- **Highlight style** - Choose between background highlighting or underline
- **Highlight color** - Customize the color used for highlighting
- **Enable highlighting** - Toggle automatic highlighting on/off

## How It Works

The plugin analyzes text content and identifies sentences that exceed your configured word threshold. It uses CodeMirror 6's decoration system for reliable highlighting that does not interfere with editing.

**Sentence detection**: The plugin splits text using common sentence delimiters (periods, exclamation marks, question marks) while handling paragraph breaks appropriately.

**Word counting**: Words are counted by splitting on whitespace and filtering out empty strings.

## Writing Tips

Long sentences can make text harder to read and understand. This plugin helps you identify sentences that might benefit from being split or simplified. Consider:

- Breaking long sentences into shorter, clearer statements
- Using bullet points or lists for complex information
- Removing unnecessary words or phrases
- Ensuring each sentence conveys one main idea

## Compatibility

- **Minimum Obsidian version**: 0.15.0.
    - Probably works for older versions, too, but have not tested it.
- **Platforms**: Desktop only. Mobile not tested
- **OS**: Linux only. Windows, macOS, … not tested
- **Modes**: Works in both editing and reading modes

## Development

### Building the Plugin

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Project Structure

- `main.ts` - Main plugin code with highlighting logic
- `manifest.json` - Plugin metadata
- `styles.css` - Additional CSS styles (if needed)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our development process, coding standards, and how to submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this plugin helpful, consider:

- Starring the repository
- Reporting issues or suggesting improvements
- Contributing to the codebase

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and version history.
