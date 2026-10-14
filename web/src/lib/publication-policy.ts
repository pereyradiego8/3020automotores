export type PublicationVehicle = {
  title?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  price_text?: string | null;
  description?: string | null;
  image_urls?: string[] | null;
};

/**
 * Validate the essential information before a draft or reserved vehicle can be
 * published. Existing published vehicles are not retroactively modified.
 */
export function getPublicationIssues(vehicle: PublicationVehicle): string[] {
  const issues: string[] = [];
  if (!vehicle.title?.trim()) issues.push('título');
  if (!vehicle.make?.trim()) issues.push('marca');
  if (!vehicle.model?.trim()) issues.push('modelo');
  if (!Number.isInteger(vehicle.year ?? NaN) || (vehicle.year ?? 0) < 1950 || (vehicle.year ?? 0) > 2100) {
    issues.push('año válido');
  }
  if (!vehicle.price_text?.trim()) issues.push('precio');
  if (!vehicle.description?.trim()) issues.push('descripción');
  if (!Array.isArray(vehicle.image_urls) || !vehicle.image_urls.some((url) => typeof url === 'string' && url.trim().length > 0)) {
    issues.push('al menos una foto');
  }
  return issues;
}
