import React from 'react'
import { render, screen } from '@testing-library/react'
import SkillCard from '../SkillCard'

describe('SkillCard 컴포넌트', () => {
  it('스킬 카드가 올바르게 렌더링되어야 함', () => {
    const mockSkill = {
      id: '1',
      name: '로봇 프로그래밍',
      description: 'ROS 기반 로봇 제어 기술',
      proficiency: 'Advanced',
    }

    render(<SkillCard skill={mockSkill} />)

    // 스킬 이름이 표시되어야 함
    expect(screen.getByText(mockSkill.name)).toBeInTheDocument()
  })

  it('필수 속성이 없을 때 에러를 처리해야 함', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const emptySkill = {
      id: '1',
      name: '',
      description: '',
    }

    render(<SkillCard skill={emptySkill} />)

    // 컴포넌트가 크래시되지 않고 렌더링되어야 함
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
