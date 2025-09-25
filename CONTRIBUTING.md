# Contributing to Long Sentence Highlighter

Thank you for your interest in contributing to the Long Sentence Highlighter plugin! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm
- Git

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/obsidian-long-sentence-highlighter.git
   cd obsidian-long-sentence-highlighter
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development:
   ```bash
   npm run dev
   ```

### Project Structure

- `src/main.ts` - Main plugin code with highlighting logic
- `src/__tests__/` - Test files
- `src/styles.css` - Plugin-specific CSS styles
- `manifest.json` - Plugin metadata for Obsidian
- `package.json` - Node.js dependencies and scripts

### Available Scripts

- `npm run dev` - Development build with watch mode
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Code Style

This project uses:
- **Prettier** for code formatting
- **ESLint** with TypeScript rules for code quality
- **Tabs** for indentation (4 spaces width)
- **Conventional Commits** for commit messages

### Code Formatting

Run `npm run format` before committing to ensure consistent formatting.

### Linting

Run `npm run lint` to check for code quality issues. Use `npm run lint:fix` to automatically fix fixable issues.

## Testing

- Write tests for new functionality in the `src/__tests__/` directory
- Run tests with `npm test`
- Aim for good test coverage of core functionality
- Test files should end with `.test.ts`

## Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages should follow this format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
git commit -m "feat: add support for custom sentence delimiters"
git commit -m "fix: handle empty content in sentence detection"
git commit -m "docs: update installation instructions"
```

## Pull Request Process

1. **Create a feature branch** from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Add tests** for new functionality

4. **Run the test suite**:
   ```bash
   npm test
   npm run lint
   npm run format:check
   npm run build
   ```

5. **Commit your changes** using conventional commit format

6. **Push to your fork** and create a pull request

7. **Fill out the PR template** with:
   - Clear description of changes
   - Screenshots/GIFs if UI changes
   - Link to any related issues

## Reporting Issues

When reporting issues, please include:

- **Obsidian version**
- **Plugin version**
- **Operating system**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Console errors** (if any)

## Feature Requests

For feature requests:

- Search existing issues first
- Describe the problem you're trying to solve
- Provide examples of how the feature would be used
- Consider if the feature aligns with the plugin's core purpose

## Development Tips

### Testing Your Changes

1. Build the plugin: `npm run build`
2. Copy the built files to your Obsidian vault's plugins folder:
   ```
   .obsidian/plugins/long-sentence-highlighter/
   ```
3. Restart Obsidian or reload the plugin
4. Test your changes in a real Obsidian environment

### Debugging

- Use `console.log()` for debugging (remove before committing)
- Check the Obsidian Developer Console (Ctrl/Cmd + Shift + I)
- Use TypeScript's strict mode benefits for catching errors early

## Code Review

All contributions go through code review. Reviewers will check:

- Code quality and style
- Test coverage
- Documentation updates
- Breaking changes
- Performance implications

## Questions?

If you have questions about contributing:

- Check existing issues and discussions
- Create a new issue with the "question" label
- Review this contributing guide and the README

Thank you for contributing!