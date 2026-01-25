module.exports = {
  // 기본 컨벤션 확장 (이게 있어야 형식을 제대로 잡습니다)
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 타입은 반드시 아래 중 하나여야 함
    'type-enum': [
      2,
      'always',
      [
        'Feat', 'Fix', 'Docs', 'Style', 'Refactor', 
        'Test', 'Chore', 'Design', 'Rename', 'Remove', 'Improve'
      ],
    ],
    // 대소문자 검사를 일단 꺼서 유연하게 만듦 (필요시 2로 변경)
    'type-case': [0],
    'subject-case': [0],
    // 제목 뒤에 마침표 금지
    'header-max-length': [2, 'always', 72],
  },
};