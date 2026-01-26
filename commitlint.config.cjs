module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 타입은 반드시 아래 리스트 중 하나여야 함 (대문자 시작)
    'type-enum': [
      2,
      'always',
      [
        'Feat', 'Fix', 'Docs', 'Style', 'Refactor', 
        'Test', 'Chore', 'Design', 'Rename', 'Remove', 'Improve'
      ],
    ],
    // 대소문자 규칙: 반드시 'PascalCase' (첫 글자 대문자)여야 함
    // 소문자(feat:)로 시작하면 에러를 띄웁니다.
    'type-case': [2, 'always', 'pascal-case'],
    
    // 제목(subject)의 첫 글자 대문자 여부는 자유롭게 (필요시 2로 변경 가능)
    'subject-case': [0],
    
    // 나머지 기본 규칙들
    'header-max-length': [2, 'always', 72],
  },
};