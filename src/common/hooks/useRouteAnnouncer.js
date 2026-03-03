import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Announces route changes to screen readers and manages focus
 * for improved accessibility during client-side navigation.
 */
const useRouteAnnouncer = (routes = []) => {
  const location = useLocation();
  const announcerRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render to avoid announcing the initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    // Find matching route title or use a default
    const matchedRoute = routes.find((route) => {
      if (route.path === location.pathname) return true;
      // Handle dynamic paths like /plays/*
      if (route.path !== '/' && location.pathname.startsWith(route.path)) return true;

      return false;
    });

    const pageTitle = matchedRoute?.title || document.title;

    // Announce the new page to screen readers
    if (announcerRef.current) {
      announcerRef.current.textContent = `Navigated to ${pageTitle}`;
    }

    // Move focus to main content area
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [location.pathname, routes]);

  return announcerRef;
};

export default useRouteAnnouncer;
