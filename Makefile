# Obsidian Plugin Makefile

.PHONY: build test clean dev

build: ## Build the plugin
	npm run build

test: ## Run tests
	npm test

dev: ## Start development mode
	npm run dev

clean: ## Clean build files
	rm -rf dist/
	rm -f main.js main.js.map
	make build
