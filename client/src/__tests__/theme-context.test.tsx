import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, renderHook, act, screen } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme, colorSchemes, type ColorScheme } from "@/lib/theme-context";

// ─── Helpers ────────────────────────────────────────────────────────────────

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(ThemeProvider, null, children);
}

function getThemeStyleEl(): HTMLStyleElement | null {
  return document.getElementById("theme-colors") as HTMLStyleElement | null;
}

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  // Start each test with a clean localStorage and no existing style element
  localStorage.clear();
  const existing = getThemeStyleEl();
  if (existing) existing.remove();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── colorSchemes array ───────────────────────────────────────────────────────

describe("colorSchemes", () => {
  it("exports exactly 6 color schemes", () => {
    expect(colorSchemes).toHaveLength(6);
  });

  it("contains all expected scheme IDs", () => {
    const ids = colorSchemes.map((s) => s.id);
    expect(ids).toEqual(
      expect.arrayContaining(["default", "forest", "ocean", "sunset", "earth", "lavender"]),
    );
  });

  it("every scheme has required fields: id, name, description", () => {
    for (const scheme of colorSchemes) {
      expect(scheme.id).toBeTruthy();
      expect(scheme.name).toBeTruthy();
      expect(scheme.description).toBeTruthy();
    }
  });

  it("lavender scheme has updated primary color #6B21BF", () => {
    const lavender = colorSchemes.find((s) => s.id === "lavender");
    expect(lavender).toBeDefined();
    expect(lavender!.primary).toBe("#6B21BF");
  });

  it("lavender scheme has accent color #A78BFA", () => {
    const lavender = colorSchemes.find((s) => s.id === "lavender");
    expect(lavender!.accent).toBe("#A78BFA");
  });

  it("all 6 schemes have primary and accent values defined", () => {
    for (const scheme of colorSchemes) {
      expect(scheme.primary).toBeDefined();
      expect(scheme.accent).toBeDefined();
    }
  });

  it("scheme IDs match the ColorScheme type values", () => {
    const validIds: ColorScheme[] = ["default", "forest", "ocean", "sunset", "earth", "lavender"];
    for (const scheme of colorSchemes) {
      expect(validIds).toContain(scheme.id);
    }
  });
});

// ─── ThemeProvider ────────────────────────────────────────────────────────────

describe("ThemeProvider", () => {
  it("renders children", () => {
    render(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement("div", { "data-testid": "child" }, "hello"),
      ),
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it('defaults to "default" scheme when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.colorScheme).toBe("default");
  });

  it("reads initial colorScheme from localStorage", () => {
    localStorage.setItem("colorScheme", "lavender");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.colorScheme).toBe("lavender");
  });

  it('reads initial colorScheme "ocean" from localStorage', () => {
    localStorage.setItem("colorScheme", "ocean");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.colorScheme).toBe("ocean");
  });

  it('creates a <style id="theme-colors"> element in document.head', () => {
    renderHook(() => useTheme(), { wrapper });
    expect(getThemeStyleEl()).not.toBeNull();
  });

  it("does not create duplicate style elements on re-render", () => {
    const { rerender } = renderHook(() => useTheme(), { wrapper });
    rerender();
    const styleEls = document.head.querySelectorAll("#theme-colors");
    expect(styleEls).toHaveLength(1);
  });

  it("injects :root CSS variable block into the style element", () => {
    renderHook(() => useTheme(), { wrapper });
    const styleEl = getThemeStyleEl();
    expect(styleEl!.innerHTML).toMatch(/^:root\s*\{/);
  });

  it("persists selected colorScheme to localStorage", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setColorScheme("forest");
    });
    expect(localStorage.getItem("colorScheme")).toBe("forest");
  });

  it("updates the style element content when scheme changes", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    const before = getThemeStyleEl()!.innerHTML;

    act(() => {
      result.current.setColorScheme("ocean");
    });

    const after = getThemeStyleEl()!.innerHTML;
    expect(after).not.toBe(before);
  });

  it("style element content contains lavender primary CSS var after switching to lavender", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setColorScheme("lavender");
    });
    // lavender: --primary: 268 71% 44%
    expect(getThemeStyleEl()!.innerHTML).toContain("268 71% 44%");
  });

  it("style element content contains lavender accent CSS var after switching to lavender", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setColorScheme("lavender");
    });
    // lavender: --accent: 255 92% 76%
    expect(getThemeStyleEl()!.innerHTML).toContain("255 92% 76%");
  });

  it("reuses existing style element rather than creating a new one", () => {
    // Pre-create the element
    const pre = document.createElement("style");
    pre.id = "theme-colors";
    document.head.appendChild(pre);

    renderHook(() => useTheme(), { wrapper });

    const styleEls = document.head.querySelectorAll("#theme-colors");
    expect(styleEls).toHaveLength(1);
    // The pre-created element is the same one that was reused
    expect(document.getElementById("theme-colors")).toBe(pre);
  });

  it("does not throw when localStorage.setItem fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    expect(() => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      act(() => {
        result.current.setColorScheme("sunset");
      });
    }).not.toThrow();
  });

  it("provides setColorScheme that updates the colorScheme in context", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.colorScheme).toBe("default");

    act(() => {
      result.current.setColorScheme("earth");
    });

    expect(result.current.colorScheme).toBe("earth");
  });

  it("cycles through all color schemes without errors", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    const schemes: ColorScheme[] = ["default", "forest", "ocean", "sunset", "earth", "lavender"];
    for (const scheme of schemes) {
      act(() => {
        result.current.setColorScheme(scheme);
      });
      expect(result.current.colorScheme).toBe(scheme);
    }
  });
});

// ─── useTheme hook ────────────────────────────────────────────────────────────

describe("useTheme", () => {
  it("returns colorScheme and setColorScheme when inside ThemeProvider", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current).toHaveProperty("colorScheme");
    expect(result.current).toHaveProperty("setColorScheme");
    expect(typeof result.current.setColorScheme).toBe("function");
  });

  it("throws when called outside ThemeProvider", () => {
    // Suppress React error boundary output
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within ThemeProvider",
    );
    consoleError.mockRestore();
  });

  it("initial colorScheme from context is a valid ColorScheme value", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    const validSchemes: ColorScheme[] = [
      "default",
      "forest",
      "ocean",
      "sunset",
      "earth",
      "lavender",
    ];
    expect(validSchemes).toContain(result.current.colorScheme);
  });
});

// ─── Regression tests ─────────────────────────────────────────────────────────

describe("regression: API surface changes", () => {
  it("useColorScheme is NOT exported (renamed to useTheme)", async () => {
    const mod = await import("@/lib/theme-context");
    // The old export name must not exist
    expect((mod as Record<string, unknown>)["useColorScheme"]).toBeUndefined();
  });

  it("useTheme IS exported", async () => {
    const mod = await import("@/lib/theme-context");
    expect(typeof mod.useTheme).toBe("function");
  });

  it("lavender schemeStyles injects correct --accent-foreground for dark theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setColorScheme("lavender");
    });
    // lavender: --accent-foreground: 255 92% 10%
    expect(getThemeStyleEl()!.innerHTML).toContain("255 92% 10%");
  });

  it("style element uses :root selector only (not .dark block)", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setColorScheme("forest");
    });
    const html = getThemeStyleEl()!.innerHTML;
    expect(html).toMatch(/^:root\s*\{/);
    expect(html).not.toContain(".dark");
  });

  it('localStorage key is "colorScheme"', () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setColorScheme("sunset");
    });
    expect(spy).toHaveBeenCalledWith("colorScheme", "sunset");
  });
});
