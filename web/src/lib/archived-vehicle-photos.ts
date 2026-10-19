const imagePrefix = 'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/historico/wp-content/uploads/';

export function resolveVehicleImageUrl(url: string): string {
  if (!url.startsWith(imagePrefix)) return url;
  const path = url.slice(imagePrefix.length);
  if (!path || /[?#\\]/.test(path) || path.split('/').some(segment => !segment || segment === '.' || segment === '..')) return url;
  return '/archivos-vehiculos/' + path;
}

export function resolveVehicleImageUrls(urls: readonly string[] | null | undefined): string[] {
  return (urls ?? []).map(resolveVehicleImageUrl);
}
