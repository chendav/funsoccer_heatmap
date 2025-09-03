module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // 在生产环境构建时允许使用 any 类型（临时解决方案）
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@next/next/no-img-element': 'warn',
  },
};