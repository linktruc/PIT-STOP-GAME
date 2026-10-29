import { useEffect, useState } from 'react';

type VisibleViewport = { width: number; height: number; top?: number; left?: number };
type OverlayRect = Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right' | 'width' | 'height'>;
type HudHostingConfig = { hudOverlaySelector?: string; hudHostingBadge?: 'netlify' | 'none' };

/** The distance from the visible viewport's bottom to an actual badge's top. */
export function visibleBottomReservation(rect: OverlayRect, viewport: VisibleViewport): number {
  const top = viewport.top ?? 0, left = viewport.left ?? 0;
  const bottom = top + viewport.height, right = left + viewport.width;
  if (rect.width <= 0 || rect.height <= 0 || rect.right <= left || rect.left >= right || rect.bottom <= top || rect.top >= bottom) return 0;
  return rect.top >= top + viewport.height * .65 ? Math.ceil(bottom - Math.max(top, rect.top)) : 0;
}

/**
 * A hosting badge can live outside this document (including a closed shadow root).
 * On mobile Netlify builds, reserve its compact expected footprint until its
 * actual bounds can be read. Measured bounds replace the estimate, so a smaller
 * or lower badge lets the game controls sit lower. Desktop has no estimate.
 */
export function hudBottomReservation({ viewport, layoutBottom, measured = 0, mobile = false, netlify = true, safeArea = 0 }: {
  viewport: VisibleViewport; layoutBottom: number; measured?: number; mobile?: boolean; netlify?: boolean; safeArea?: number;
}): number {
  const expectedBadge = mobile && netlify ? 48 + Math.max(28, safeArea) : 0;
  const footprint = measured > 0 ? measured : expectedBadge;
  return Math.ceil(Math.max(0, layoutBottom - ((viewport.top ?? 0) + viewport.height) + footprint));
}

function hostingConfig(): HudHostingConfig { return window.PIT_CONFIG as HudHostingConfig ?? {}; }
function visibleViewport(): VisibleViewport {
  const vv = window.visualViewport;
  return { width: vv?.width ?? window.innerWidth, height: vv?.height ?? window.innerHeight, top: vv?.offsetTop ?? 0, left: vv?.offsetLeft ?? 0 };
}
function mobileDock(): boolean { return window.matchMedia('(max-width: 600px), (pointer: coarse) and (max-height: 600px)').matches; }

/** Read hosting overlays without moving, hiding, or changing their DOM. */
export function useHudClearance(): number {
  const [reservation, setReservation] = useState(() => typeof window === 'undefined' ? 0 : hudBottomReservation({ viewport: visibleViewport(), layoutBottom: window.innerHeight, mobile: mobileDock(), netlify: hostingConfig().hudHostingBadge !== 'none' }));
  useEffect(() => {
    const selectors = ['[data-pit-overlay-reservation]', '#netlify-badge', 'netlify-badge', '[data-netlify-badge]', '[data-netlify-site-badge]', '[class*="netlify-badge" i]', '[aria-label*="Powered by Netlify" i]', 'iframe[title*="Netlify" i]', 'iframe[src*="netlify" i]'];
    const configured = hostingConfig().hudOverlaySelector;
    if (configured) selectors.push(configured);
    let frame = 0;
    const safeAreaProbe = document.createElement('span');
    safeAreaProbe.setAttribute('aria-hidden', 'true');
    safeAreaProbe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;bottom:0;right:0;width:0;height:var(--pit-safe-area-bottom,env(safe-area-inset-bottom,0px));';
    document.body.append(safeAreaProbe);
    const resize = new ResizeObserver(() => schedule());
    resize.observe(safeAreaProbe);
    const watched = new Set<Element>();
    const measure = () => {
      frame = 0;
      const overlays: Element[] = [];
      for (const selector of selectors) { try { for (const node of document.querySelectorAll(selector)) if (!overlays.includes(node)) overlays.push(node); } catch { /* Ignore only the malformed optional selector. */ } }
      for (const node of watched) if (!overlays.includes(node)) { resize.unobserve(node); watched.delete(node); }
      let measured = 0;
      const viewport = visibleViewport();
      for (const node of overlays) {
        if (!watched.has(node)) { watched.add(node); resize.observe(node); }
        const style = getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
        if (node.checkVisibility && !node.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})) continue;
        measured = Math.max(measured, visibleBottomReservation(node.getBoundingClientRect(), viewport));
      }
      const layoutBottom = document.querySelector('.game-shell')?.getBoundingClientRect().bottom ?? document.documentElement.clientHeight;
      const next = hudBottomReservation({ viewport, layoutBottom, measured, mobile: mobileDock(), netlify: hostingConfig().hudHostingBadge !== 'none', safeArea: safeAreaProbe.getBoundingClientRect().height });
      setReservation(current => current === next ? current : next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const containsOverlay = (node: Element) => {
      if ([...watched].some(overlay => node === overlay || node.contains(overlay))) return true;
      return selectors.some(selector => { try { return node.matches(selector) || !!node.querySelector(selector); } catch { return false; } });
    };
    const mutations = new MutationObserver(records => {
      // Marker transforms and timer text cannot affect badge clearance. Avoid
      // querying the whole document for these per-frame scene updates.
      const relevant = records.some(record => record.type === 'attributes'
        ? record.target instanceof Element && containsOverlay(record.target)
        : [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element && containsOverlay(node)));
      if (relevant) schedule();
    });
    mutations.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'id', 'data-netlify-badge', 'data-pit-overlay-reservation']});
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('scroll', schedule);
    schedule();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      mutations.disconnect(); resize.disconnect(); safeAreaProbe.remove();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, []);
  return reservation;
}
