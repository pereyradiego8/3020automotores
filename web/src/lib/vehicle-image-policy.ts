/**
 * Allowed vehicle image locations.
 *
 * Historical URLs are read-only: they must ALREADY be present on this vehicle.
 * The dealership may reorder or remove these links without being able to inject
 * an arbitrary third-party image into its public catalog.
 */
export const HISTORICAL_IMAGE_PREFIXES = [
  'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/historico/wp-content/uploads/',
  // Backward compatibility for any older records created before /historico/.
  'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/wp-content/uploads/',
] as const;

type VehicleImageLocation =
  | { kind: 'storage'; objectPath: string }
  | { kind: 'historical'; objectPath: null };

function safeRelativePath(path: string): boolean {
  if (!path || /[?#\\]/.test(path) || /%(?:2e|2f|5c|3f|23)/i.test(path)) return false;
  return path.split('/').every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

export function classifyVehicleImage(
  url: string,
  vehicleId: string,
  supabaseUrl: string,
  existingImages: readonly string[],
): VehicleImageLocation | null {
  if (!url || !vehicleId || !supabaseUrl || typeof url !== 'string') return null;

  const storagePrefix = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/vehicle-images/`;
  if (storagePrefix.startsWith('https://') && url.startsWith(storagePrefix)) {
    const objectPath = url.slice(storagePrefix.length);
    return objectPath.startsWith(`${vehicleId}/`) && safeRelativePath(objectPath)
      ? { kind: 'storage', objectPath }
      : null;
  }

  for (const prefix of HISTORICAL_IMAGE_PREFIXES) {
    if (!url.startsWith(prefix)) continue;
    const relativePath = url.slice(prefix.length);
    return existingImages.includes(url) && safeRelativePath(relativePath)
      ? { kind: 'historical', objectPath: null }
      : null;
  }

  return null;
}
