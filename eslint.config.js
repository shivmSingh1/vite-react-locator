import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["dist/**", "example/**", "node_modules/**", "coverage/**"],
	},
	js.configs.recommended,
	...tseslint.configs.recommendedTypeChecked.map((config) => ({
		...config,
		files: ["src/**/*.ts"],
	})),
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/consistent-type-imports": "error",
		},
	},
);
