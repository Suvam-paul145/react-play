import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useRouteAnnouncer from '../useRouteAnnouncer';

const routes = [
  { path: '/', title: 'ReactPlay - Home' },
  { path: '/plays', title: 'ReactPlay - Plays' },
  { path: '/ideas', title: 'ReactPlay - Ideas' }
];

const wrapper = ({ children, initialEntries }) => (
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
);

describe('useRouteAnnouncer', () => {
  it('returns a ref object', () => {
    const { result } = renderHook(() => useRouteAnnouncer(routes), {
      wrapper: ({ children }) => wrapper({ children, initialEntries: ['/'] })
    });

    expect(result.current).toHaveProperty('current');
  });

  it('does not announce on initial render', () => {
    const announcerDiv = document.createElement('div');
    const { result } = renderHook(() => useRouteAnnouncer(routes), {
      wrapper: ({ children }) => wrapper({ children, initialEntries: ['/'] })
    });

    // Simulate ref attachment
    act(() => {
      result.current.current = announcerDiv;
    });

    expect(announcerDiv.textContent).toBe('');
  });
});
