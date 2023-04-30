import React from 'react'
import styled from 'styled-components'

const Select = styled.select`
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

const Option = styled.option`
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


export const CustomSelect = ({ options, onChange }) => {
  return (
    <Select onChange={onChange}>
      {options?.map((option: any, i: any) => (
        <Option key={i} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
};
