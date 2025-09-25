module.exports = {
	testEnvironment: 'node',
	moduleFileExtensions: ['js', 'ts'],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
	},
	testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
	moduleNameMapper: {
		'^obsidian$': '<rootDir>/__mocks__/obsidian.ts',
	},
};
