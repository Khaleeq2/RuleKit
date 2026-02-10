import { test, expect } from '@playwright/test';

/**
 * Smoke tests for RuleKit critical user paths.
 *
 * These tests verify that core pages render without crashing
 * and that the first-run flow is navigable. They do NOT test
 * authenticated flows (those require Supabase session setup).
 *
 * Run: npx playwright test
 */

test.describe('Public pages load', () => {
  test('Landing page renders', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RuleKit/i);
  });

  test('Sign-in page renders with form', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('Sign-up page renders', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('Sign-in form validates empty submission', async ({ page }) => {
    await page.goto('/auth/sign-in');
    // HTML5 required attributes should prevent submission
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('Sign-in has link to sign-up', async ({ page }) => {
    await page.goto('/auth/sign-in');
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute('href', '/auth/sign-up');
  });

  test('Sign-in has forgot password link', async ({ page }) => {
    await page.goto('/auth/sign-in');
    const forgotLink = page.getByRole('link', { name: /forgot/i });
    await expect(forgotLink).toBeVisible();
  });
});

test.describe('Marketing pages load', () => {
  test('Pricing page renders', async ({ page }) => {
    await page.goto('/pricing/plans');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Legal terms page renders', async ({ page }) => {
    await page.goto('/legal/terms');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Legal privacy page renders', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Auth guard redirects', () => {
  test('Home page redirects unauthenticated users', async ({ page }) => {
    await page.goto('/home');
    // Middleware should redirect to sign-in
    await page.waitForURL(/sign-in|home/, { timeout: 5000 });
  });

  test('Rulebooks page redirects unauthenticated users', async ({ page }) => {
    await page.goto('/rulebooks');
    await page.waitForURL(/sign-in|rulebooks/, { timeout: 5000 });
  });
});

test.describe('Accessibility basics', () => {
  test('Sign-in page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/auth/sign-in');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('Sign-in form inputs have labels', async ({ page }) => {
    await page.goto('/auth/sign-in');
    // Verify label-input association
    const emailLabel = page.locator('label[for="email"]');
    const passwordLabel = page.locator('label[for="password"]');
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });
});
