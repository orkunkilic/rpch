import React from 'react'
import styled from 'styled-components';

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  margin-bottom: 1.2rem;
  padding: 1.2rem;
  width: 75%;
  font-size: ${({ theme }) => theme.fontSizes.text};
  color: ${({ theme }) => theme.colors.text.default};
  background-color: ${({ theme }) => theme.colors.background.default};
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.small};
  }
`

export const CustomInput = ({
  placeholder,
  value,
  onChange,
}) => {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  )
}
