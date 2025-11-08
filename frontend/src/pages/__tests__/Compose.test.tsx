import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

import Compose from '../Compose'
import * as api from '../../api'

describe('Compose page', () => {
  afterEach(() => vi.restoreAllMocks())

  test('submits createPost and shows success status', async () => {
    const createSpy = vi.spyOn(api, 'createPost').mockResolvedValue({ id: 'x1', status: 'SCHEDULED' })
    render(<Compose />)

    const textarea = screen.getByLabelText(/Text/i)
    await userEvent.type(textarea, 'hello there')

    const submit = screen.getByRole('button', { name: /Schedule/i })
    await userEvent.click(submit)

    await waitFor(() => expect(createSpy).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText(/Success:/i)).toBeInTheDocument())
  })
})
