"use client";

import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';

import { motion } from 'framer-motion';
import Link from 'next/link';

type CardNavLink = {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  onGetStarted?: () => void;
  rightActions?: React.ReactNode;
  variant?: 'floating' | 'dashboard';
}

const CardNav: React.FC<CardNavProps> = ({
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#0B0B12',
  menuColor = '#ffffff',
  buttonBgColor = 'linear-gradient(to right, #934AC5, #7B3FE4)',
  buttonTextColor = '#ffffff',
  onGetStarted,
  rightActions,
  variant = 'floating',
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        void contentEl.offsetHeight;

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return tl;
  };

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : React.useEffect;

  useIsomorphicLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useIsomorphicLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  const isDashboard = variant === 'dashboard';

  return (
    <div className={`z-[99] box-border ${isDashboard ? 'relative w-full' : 'absolute left-1/2 top-5 md:top-8 w-[90%] max-w-[900px] -translate-x-1/2'} ${className}`}>
      <nav
        ref={navRef}
        className={`card-nav relative block h-[60px] overflow-hidden p-0 will-change-[height] ${
          isDashboard 
            ? 'rounded-none border-b border-white/5 backdrop-blur-xl' 
            : 'rounded-2xl border border-white/10 shadow-lg'
        } ${isExpanded && !isDashboard ? 'bg-[#141422]' : ''}`}
        style={{ 
          backgroundColor: isDashboard 
            ? baseColor
            : (isExpanded ? '#141422' : baseColor), 
          transition: 'background-color 0.3s' 
        }}
      >
        <div className={`absolute inset-x-0 top-0 z-[2] flex h-[60px] items-center justify-between py-1.5 ${isDashboard ? 'px-6' : 'px-4 md:pl-4 md:pr-1.5'}`}>
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <div
              className={`group flex h-full cursor-pointer flex-col items-center justify-center gap-1.5 ${isHamburgerOpen ? 'open' : ''}`}
              onClick={toggleMenu}
              role="button"
              aria-label={isExpanded ? 'Close menu' : 'Open menu'}
              tabIndex={0}
              style={{ color: menuColor }}
            >
              <div className={`h-[2px] w-[30px] origin-center bg-current transition-all duration-200 ease-out group-hover:opacity-75 ${isHamburgerOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
              <div className={`h-[2px] w-[30px] origin-center bg-current transition-all duration-200 ease-out group-hover:opacity-75 ${isHamburgerOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
            </div>

            {/* Logo container */}
            <Link href="/" className="flex items-center justify-center">
              <img src="/images/fulllogo.png" alt="StyleSync" className="h-7 md:h-8 w-auto drop-shadow-[0_0_12px_rgba(147,74,197,0.3)] transition hover:brightness-110" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Optional Action Button */}
            {onGetStarted && !rightActions && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="rounded-xl px-4 py-1.5 text-sm font-semibold transition-all hover:brightness-110 shadow-[0_0_16px_rgba(147,74,197,0.35)]"
                style={{ background: buttonBgColor, color: buttonTextColor }}
              >
                Get Started
              </motion.button>
            )}

            {/* Custom Right Actions for Dashboard */}
            {rightActions && (
              <div className="flex items-center">
                {rightActions}
              </div>
            )}
          </div>
        </div>

        {/* Expanding Content */}
        <div 
          className={`card-nav-content absolute inset-x-0 bottom-0 top-[60px] z-[1] flex flex-col items-stretch justify-start gap-2 md:flex-row md:items-stretch md:gap-3 ${isDashboard ? 'p-6' : 'p-2'}`}
          style={{
            visibility: isExpanded ? 'visible' : 'hidden',
            pointerEvents: isExpanded ? 'auto' : 'none'
          }}
          aria-hidden={!isExpanded}
        >
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="relative flex flex-auto flex-col gap-2 rounded-xl p-3 md:p-5 min-w-0"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor, minHeight: '60px', height: '100%', maxHeight: 'none', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="text-lg md:text-xl font-medium tracking-tight" style={{ color: item.textColor }}>{item.label}</div>
              <div className="mt-auto flex flex-col gap-1 md:gap-1.5">
                {item.links?.map((lnk, i) => {
                  const content = (
                    <>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      {lnk.label}
                    </>
                  );
                  const className = "inline-flex w-fit items-center gap-1.5 text-sm transition-opacity hover:opacity-70 text-left";
                  
                  const handleItemClick = (e: React.MouseEvent) => {
                    if (lnk.onClick) lnk.onClick(e);
                    if (isExpanded) toggleMenu();
                  };

                  if (lnk.href) {
                    return (
                      <Link key={`${lnk.label}-${i}`} className={className} href={lnk.href} aria-label={lnk.ariaLabel} style={{ color: item.textColor }} onClick={handleItemClick}>
                        {content}
                      </Link>
                    );
                  }
                  
                  return (
                    <button key={`${lnk.label}-${i}`} type="button" className={className} aria-label={lnk.ariaLabel} style={{ color: item.textColor }} onClick={handleItemClick}>
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
