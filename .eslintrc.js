module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'prettier', // tắt rule xung đột với Prettier
  ],
  plugins: ['react', 'react-native', 'prettier'],
  env: {
    es2021: true,
    node: true,
    'react-native/react-native': true,
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 13,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error', // ESLint báo lỗi nếu code không đúng Prettier
    eqeqeq: ['warn', 'always'], // Bắt dùng === và !==
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Bỏ qua biến bắt đầu bằng _
    'react-hooks/exhaustive-deps': 'warn', // cảnh báo hook thiếu dependencies
    'react/no-unescaped-entities': 'warn', // escape ký tự trong JSX
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
