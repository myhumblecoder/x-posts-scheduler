import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tile from '../Tile'

test('renders Tile with title and caption', () => {
  render(<Tile id="t1" title="Hello" caption="A caption" />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
  expect(screen.getByText('A caption')).toBeInTheDocument()
})
