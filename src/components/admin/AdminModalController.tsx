'use client';

import { useEffect } from 'react';

const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function visibleDialogs() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')
  ).filter((dialog) => dialog.getClientRects().length > 0);
}

function focusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.getClientRects().length > 0
  );
}

/**
 * Retrofitted behavior layer for the admin's existing dialogs and drawers.
 * It keeps keyboard focus inside the top-most dialog, supports Escape, restores
 * focus to the opener, and prevents the page behind a modal from scrolling.
 */
export default function AdminModalController() {
  useEffect(() => {
    let activeDialog: HTMLElement | null = null;
    let returnFocus: HTMLElement | null = null;
    const previousOverflow = document.body.style.overflow;

    const syncDialog = () => {
      const dialogs = visibleDialogs();
      const nextDialog = dialogs.at(-1) || null;

      if (nextDialog === activeDialog) return;

      if (!nextDialog) {
        activeDialog = null;
        document.body.style.overflow = previousOverflow;
        document.body.classList.remove('admin-modal-open');
        returnFocus?.focus({ preventScroll: true });
        returnFocus = null;
        return;
      }

      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      activeDialog = nextDialog;
      if (!activeDialog.hasAttribute('tabindex')) activeDialog.tabIndex = -1;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('admin-modal-open');

      if (!activeDialog.hasAttribute('aria-label') && !activeDialog.hasAttribute('aria-labelledby')) {
        const heading = activeDialog.querySelector<HTMLElement>('h1, h2, h3');
        if (heading) {
          if (!heading.id) heading.id = `admin-dialog-title-${Date.now()}`;
          activeDialog.setAttribute('aria-labelledby', heading.id);
        }
      }

      requestAnimationFrame(() => {
        const preferred = activeDialog?.querySelector<HTMLElement>(
          '[data-initial-focus], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
        );
        const first = activeDialog ? focusableElements(activeDialog)[0] : null;
        (preferred || first || activeDialog)?.focus({ preventScroll: true });
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const dialogs = visibleDialogs();
      const dialog = dialogs.at(-1);
      if (!dialog) return;

      if (event.key === 'Escape') {
        const closeButton = dialog.querySelector<HTMLButtonElement>(
          '[data-dialog-close], button[aria-label^="ปิด"]'
        );
        if (closeButton && !closeButton.disabled) {
          event.preventDefault();
          event.stopPropagation();
          closeButton.click();
        }
        return;
      }

      if (event.key !== 'Tab') return;
      const items = focusableElements(dialog);
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    const observer = new MutationObserver(syncDialog);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', onKeyDown, true);
    syncDialog();

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('admin-modal-open');
    };
  }, []);

  return null;
}
