# Agent Guidelines for Obsidian Long Sentence Highlighter

## Build Commands
- `npm run dev` - Development build with watch mode
- `npm run build` - Production build (runs TypeScript check first)
- `npm run version` - Bump version and update manifest

## Code Style
- **Indentation**: Tabs (4 spaces width) as per .editorconfig
- **Imports**: Import from 'obsidian' package, destructure commonly used classes
- **Types**: Use TypeScript interfaces for settings and data structures
- **Naming**: camelCase for variables/methods, PascalCase for classes
- **Classes**: Extend Obsidian base classes (Plugin, Modal, PluginSettingTab)
- **Settings**: Use Object.assign pattern for default settings merge
- **Async**: Use async/await for data operations (loadData/saveData)

## ESLint Rules
- No unused variables (except function args)
- TypeScript recommended rules enabled
- Empty functions allowed for Obsidian lifecycle methods

## File Structure
- main.ts - Main plugin class and core functionality
- manifest.json - Plugin metadata
- styles.css - Plugin-specific styles