'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="เลื่อนกลับขึ้นด้านบน"
      className="scroll-top"
    >
      <ArrowUp aria-hidden="true" />
    </button>
  );
}
