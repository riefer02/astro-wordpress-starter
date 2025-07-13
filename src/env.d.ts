/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import('./types').User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
}
