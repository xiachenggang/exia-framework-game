import stylistic from "@stylistic/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

/** 将配置对象中所有 error 级别规则降为 warn */
function downgradeToWarn(config) {
  if (!config.rules) return config;
  return {
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules).map(([key, value]) => [
        key,
        Array.isArray(value)
          ? ["warn", ...value.slice(1)]
          : value === "error"
          ? "warn"
          : value,
      ])
    ),
  };
}

export default tseslint.config(
  // ─── 忽略非业务目录 ────────────────────────────────────────────────────────
  {
    ignores: [
      "node_modules/**",
      "temp/**",
      "library/**",
      "build/**",
      "native/**",
    ],
  },

  // ─── typescript-eslint 推荐规则（全部降为 warn）─────────────────────────
  // 必须先于自定义规则，以便注册 @typescript-eslint plugin
  ...tseslint.configs.recommended.map(downgradeToWarn),

  // ─── 自定义规则 ────────────────────────────────────────────────────────────
  {
    files: ["assets/script/**/*.ts"],
    plugins: {
      "simple-import-sort": simpleImportSort,
      "@stylistic": stylistic,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ── 禁止 any ────────────────────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "warn",

      // ── 禁止 == ─────────────────────────────────────────────────────────
      eqeqeq: ["warn", "always"],

      // ── 禁止 @ts-ignore / @ts-expect-error ──────────────────────────────
      "@typescript-eslint/ban-ts-comment": "warn",

      // ── 函数必须声明返回类型（简单表达式回调可省略）────────────────────────
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],

      // ── 显式访问修饰符（构造函数除外）──────────────────────────────────────
      "@typescript-eslint/explicit-member-accessibility": [
        "warn",
        {
          accessibility: "explicit",
          overrides: {
            constructors: "off",
          },
        },
      ],

      // ── 命名规范 ────────────────────────────────────────────────────────
      "@typescript-eslint/naming-convention": [
        "warn",
        // 类：PascalCase
        { selector: "class", format: ["PascalCase"] },
        // 接口：I + PascalCase
        { selector: "interface", format: ["PascalCase"], prefix: ["I"] },
        // 类型别名：T + PascalCase
        { selector: "typeAlias", format: ["PascalCase"], prefix: ["T"] },
        // 枚举：PascalCase
        { selector: "enum", format: ["PascalCase"] },
        // 枚举成员：UPPER_CASE
        { selector: "enumMember", format: ["UPPER_CASE"] },
        // 泛型参数：T + PascalCase
        { selector: "typeParameter", format: ["PascalCase"], prefix: ["T"] },
        // 变量：camelCase 或 UPPER_CASE（全局常量），允许 _ 前缀（未使用参数）
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        // 函数：camelCase
        { selector: "function", format: ["camelCase"] },
        // 私有属性：必须加 _ 前缀
        {
          selector: "classProperty",
          modifiers: ["private"],
          format: ["camelCase"],
          leadingUnderscore: "require",
        },
        // 私有方法：不加 _ 前缀
        {
          selector: "classMethod",
          modifiers: ["private"],
          format: ["camelCase"],
          leadingUnderscore: "forbid",
        },
        // public 属性和方法：禁止 _ 前缀
        {
          selector: "classProperty",
          modifiers: ["public"],
          format: ["camelCase"],
          leadingUnderscore: "forbid",
        },
        {
          selector: "classMethod",
          modifiers: ["public"],
          format: ["camelCase"],
          leadingUnderscore: "forbid",
        },
        // protected 属性和方法：禁止 _ 前缀
        {
          selector: "classProperty",
          modifiers: ["protected"],
          format: ["camelCase"],
          leadingUnderscore: "forbid",
        },
        {
          selector: "classMethod",
          modifiers: ["protected"],
          format: ["camelCase"],
          leadingUnderscore: "forbid",
        },
        // 布尔类型变量：必须以语义前缀开头
        {
          selector: "variable",
          types: ["boolean"],
          format: ["camelCase"],
          leadingUnderscore: "allow",
          prefix: [
            "is",
            "has",
            "should",
            "can",
            "will",
            "need",
            "allow",
            "enable",
            "disable",
            "show",
            "hide",
          ],
        },
      ],

      // ── 类成员排序（仅约束属性顺序，方法顺序不限）──────────────────────
      "@typescript-eslint/member-ordering": [
        "warn",
        {
          default: [
            "public-static-field",
            "protected-static-field",
            "private-static-field",
            "public-instance-field",
            "protected-instance-field",
            "private-instance-field",
            "constructor",
            "method",
          ],
        },
      ],

      // ── import 排序（可自动修复）──────────────────────────────────────────
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",

      // ── 允许短路求值作为语句（如 condition && sideEffect()）──────────────
      "@typescript-eslint/no-unused-expressions": [
        "warn",
        {
          allowShortCircuit: true,
        },
      ],

      // ── 未使用变量（允许 _ 开头）─────────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // ── 格式化规则（保存时自动修复）──────────────────────────────────────
      "@stylistic/indent": ["warn", 4],
      "@stylistic/quotes": ["warn", "double"],
      "@stylistic/semi": ["warn", "always"],
      "@stylistic/comma-dangle": ["warn", "never"],
      "@stylistic/eol-last": ["warn", "always"],
      "@stylistic/no-trailing-spaces": "warn",
      "@stylistic/space-before-blocks": "warn",
      "@stylistic/keyword-spacing": "warn",
      "@stylistic/space-infix-ops": "warn",
      "@stylistic/object-curly-spacing": ["warn", "always"],
      "@stylistic/array-bracket-spacing": ["warn", "never"],
      "@stylistic/space-before-function-paren": [
        "warn",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "@stylistic/arrow-spacing": "warn",
      "@stylistic/type-annotation-spacing": "warn",
      "@stylistic/member-delimiter-style": [
        "warn",
        {
          multiline: { delimiter: "semi", requireLast: true },
          singleline: { delimiter: "semi", requireLast: false },
        },
      ],
    },
  }
);
