# Changelog

## [Unreleased]

### Added

- Prettier configuration for consistent code formatting
- ESLint configuration and scripts for code quality
- GitHub Actions CI/CD pipeline for automated testing and building
- Commitlint configuration for conventional commit messages
- Comprehensive test coverage improvements
- Professional repository structure and documentation

### Changed

- Improved project organization and development workflow
- Enhanced build process with automated formatting and linting

### Fixed

- Test file declaration issues and TypeScript compatibility

## [1.0.0] - 2025-08-31

### Added

- Initial release of Long Sentence Highlighter plugin
- Automatic highlighting of long sentences
- Configurable word threshold (default: 20 words)
- Two highlighting styles: background highlighting and underline
- Customizable highlight colors with dark mode support
- Toggle functionality to enable/disable highlighting
- Command palette integration with three commands:
    - Toggle long sentence highlighting
    - Highlight long sentences in current note
    - Clear sentence highlights
- Sentence detection using periods, exclamation marks, and question marks
- Paragraph break handling
- Theme-aware color adjustments

### Technical Features

- TypeScript implementation with proper type safety
- Jest testing framework setup
- MIT license
- Minimum Obsidian version: 0.15.0

## alpha - 2024-09-25

- Simple sentence highlighting

## General

[Unreleased]: https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/compare/1.0.0...HEAD
[1.0.0]: https://github.com/RobertMeissner/obsidian-long-sentence-highlighter/releases/tag/1.0.0

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
