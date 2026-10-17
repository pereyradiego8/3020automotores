import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../supabase/migrations/20261014160000_atomic_vehicle_sales.sql', import.meta.url), 'utf8');
const actions = readFileSync(new URL('../src/app/admin/actions.ts', import.meta.url), 'utf8');

// Static contract checks. These are not substitutes for running the
// migration and functional scenarios against an isolated Supabase database.
test('sale status RPC is invoker-based and restricted to authenticated staff', () => {
  assert.match(migration, /function public\.save_vehicle_sale_atomic\(/);
  assert.match(migration, /security invoker/i);
  assert.match(migration, /revoke all on function public\.save_vehicle_sale_atomic[\s\S]*?from public, anon/i);
  assert.match(migration, /grant execute on function public\.save_vehicle_sale_atomic[\s\S]*?to authenticated/i);
  assert.match(migration, /if not private\.is_inventory_admin\(\)/i);
});

test('private document cleanup is queued in the database transaction', () => {
  assert.match(migration, /create table if not exists private\.sale_document_cleanup_queue/i);
  assert.match(migration, /alter table private\.sale_document_cleanup_queue enable row level security/i);
  assert.match(migration, /insert into private\.sale_document_cleanup_queue/i);
  assert.match(migration, /delete from public\.vehicle_sales/i);
  assert.match(migration, /update public\.vehicles set status = p_status/i);
  assert.match(migration, /function public\.acknowledge_sale_document_cleanup/i);
  assert.match(migration, /function public\.list_pending_sale_document_cleanup/i);
});

test('admin sale action uses the transaction RPC without a non-atomic fallback', () => {
  const saleAction = actions.slice(actions.indexOf('export async function setVehicleStatusAndSale'));
  assert.match(saleAction, /supabase\.rpc\('save_vehicle_sale_atomic'/);
  assert.doesNotMatch(saleAction, /from\('vehicle_sales'\)\.(insert|upsert|delete)/);
  assert.doesNotMatch(saleAction, /from\('vehicles'\)\.update\(\{ status \}\)/);
  const saveIndex = saleAction.indexOf("supabase.rpc('save_vehicle_sale_atomic'");
  const removeIndex = saleAction.indexOf('removeQueuedSaleDocuments');
  assert.ok(saveIndex >= 0 && removeIndex > saveIndex, 'Storage cleanup should follow a successful transaction');
});

test('admin only generates temporary links to private documents on demand', () => {
  const adminPage = readFileSync(new URL('../src/app/admin/page.tsx', import.meta.url), 'utf8');
  const linkControl = readFileSync(new URL('../src/app/admin/PrivateSaleDocumentLink.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(adminPage, /createSignedUrl/);
  assert.match(linkControl, /createSignedUrl\(path, 300\)/);
  assert.match(linkControl, /expiresAt: Date\.now\(\) \+ 4 \* 60 \* 1000/);
  assert.match(linkControl, /rel="noopener noreferrer"/);
});

test('migration has exactly three complete RPC declarations and no duplicated tail', () => {
  const functions = migration.match(/create or replace function public\./g) || [];
  const delimiters = migration.match(/\$function\$/g) || [];
  assert.equal(functions.length, 3);
  assert.equal(delimiters.length, 6);
  assert.equal((migration.match(/function public\.save_vehicle_sale_atomic\(/g) || []).length, 3,
    'One definition plus the two grant/revoke signatures expected');
  assert.match(migration.trim(), /to authenticated;$/);
  assert.doesNotMatch(migration, /path !~ \('\^' \|\| p_vehicle_id::text \|\| '\/[a-zA-Z0-9._-]+\s*\n/);
});

test('removed files from an edited sale are queued and reattached files are excluded', () => {
  assert.match(migration, /not \(removed\.object_path = any\(v_document_paths\)\)/);
  assert.match(migration, /delete from private\.sale_document_cleanup_queue[\s\S]+?object_path = any\(v_document_paths\)/);
  assert.match(migration, /from unnest\(v_document_paths\) as docs\(path\)/);
  assert.match(migration, /or docs\.path !~/);
  assert.match(migration, /grant usage on schema private to authenticated/);
});
