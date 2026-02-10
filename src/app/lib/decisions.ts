// ============================================
// Legacy re-export — all logic now lives in rulebooks.ts
// This file exists only for backward compatibility during migration.
// ============================================

'use client';

export { rulebooksRepo as decisionsRepo, schemasRepo, rulesRepo } from './rulebooks';
