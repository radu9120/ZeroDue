import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    getAll: vi.fn(() => []),
  }),
}));
