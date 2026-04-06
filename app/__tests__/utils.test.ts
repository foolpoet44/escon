/**
 * 기본 유틸리티 함수 테스트
 * Jest 설정 검증용 샘플 테스트
 */

describe('유틸리티 함수 테스트', () => {
  it('기본 수학 연산이 정상 작동해야 함', () => {
    expect(1 + 1).toBe(2)
    expect(5 - 3).toBe(2)
    expect(2 * 3).toBe(6)
  })

  it('배열 함수가 정상 작동해야 함', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(arr.length).toBe(5)
    expect(arr.includes(3)).toBe(true)
    expect(arr.filter(x => x > 3)).toEqual([4, 5])
  })

  it('객체 비교가 정상 작동해야 함', () => {
    const obj = { name: 'Test', value: 42 }
    expect(obj.name).toBe('Test')
    expect(obj).toEqual({ name: 'Test', value: 42 })
  })
})
