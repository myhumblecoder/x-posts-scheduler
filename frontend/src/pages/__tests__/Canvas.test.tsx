import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

import Canvas from '../Canvas'
import * as api from '../../api'

describe('Canvas page', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('loads scheduled posts and can save layout', async () => {
    const postsInitial = [
      { id: 'p1', content_text: 'First post', scheduled_at: new Date().toISOString() },
      { id: 'p2', content_text: 'Second post', scheduled_at: new Date().toISOString() },
    ]

    // getScheduled called on mount, then again after create; provide two responses
    const getScheduledSpy = vi.spyOn(api, 'getScheduled').mockResolvedValue(postsInitial)
    const saveLayoutSpy = vi.spyOn(api, 'saveLayout').mockResolvedValue([])

    render(<Canvas />)

    // Wait for posts to appear
    await waitFor(() => {
      expect(screen.getByText('First post')).toBeInTheDocument()
      expect(screen.getByText('Second post')).toBeInTheDocument()
    })

    // Click Save layout -> should call saveLayout with ordered ids
    const saveBtn = screen.getByRole('button', { name: /Save layout/i })
    await userEvent.click(saveBtn)

    await waitFor(() => {
      expect(saveLayoutSpy).toHaveBeenCalled()
      const calledWith = saveLayoutSpy.mock.calls[0][0]
      expect(Array.isArray(calledWith)).toBe(true)
      expect(calledWith[0].id).toBe('p1')
    })

    expect(getScheduledSpy).toHaveBeenCalled()
  })

  test('create post flow calls createPost and refreshes list', async () => {
    const postsBefore = [ { id: 'p1', content_text: 'Existing', scheduled_at: new Date().toISOString() } ]
    const postsAfter = [ ...postsBefore, { id: 'p3', content_text: 'New post', scheduled_at: new Date().toISOString() } ]

    const getScheduledSpy = vi.spyOn(api, 'getScheduled')
      .mockResolvedValueOnce(postsBefore)
      .mockResolvedValueOnce(postsAfter)

    const createSpy = vi.spyOn(api, 'createPost').mockResolvedValue({ id: 'p3' })

    render(<Canvas />)

    // Wait for initial
    await waitFor(() => expect(screen.getByText('Existing')).toBeInTheDocument())

    // Fill create form
    await userEvent.type(screen.getByLabelText(/Text/i), 'New post')
    // schedule left empty
    await userEvent.click(screen.getByRole('button', { name: /Create & schedule/i }))

    await waitFor(() => expect(createSpy).toHaveBeenCalled())

    // After refresh, new item should appear
    await waitFor(() => expect(screen.getByText('New post')).toBeInTheDocument())
    expect(getScheduledSpy).toHaveBeenCalledTimes(2)
  })
})
