import source from '../data/catalogo-historico.json';

export type Vehicle = {
  title: string;
  legacy_path: string;
  image: string;
  legacy_price: string;
  legacy_mileage: string;
  body_type: string;
  fuel: string;
  year: string;
  engine: string;
  doors: string;
  transmission: string;
  availability: string;
  price_status: string;
};

export const vehicles = source.records as Vehicle[];

export function slugify(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function vehicleSlug(vehicle: Vehicle) {
  return slugify(vehicle.title);
}

export function historicalImage(vehicle: Vehicle) {
  return 'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/' + vehicle.image;
}
