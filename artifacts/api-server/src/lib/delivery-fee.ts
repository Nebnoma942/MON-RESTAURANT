import { db, deliveryZonesTable } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";

export const MIN_DELIVERY_FEE = 1000;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function calculateDeliveryFee(params: {
  city: string;
  restaurantLat?: number | null;
  restaurantLng?: number | null;
  customerLat?: number | null;
  customerLng?: number | null;
}): Promise<{ fee: number; zoneId: number | null; zoneName: string | null; distanceKm: number | null }> {
  const zones = await db.select().from(deliveryZonesTable)
    .where(and(eq(deliveryZonesTable.city, params.city), eq(deliveryZonesTable.isActive, true)))
    .orderBy(asc(deliveryZonesTable.priority));

  const distanceKm = params.restaurantLat != null && params.restaurantLng != null && params.customerLat != null && params.customerLng != null
    ? haversineKm(params.restaurantLat, params.restaurantLng, params.customerLat, params.customerLng)
    : null;

  // A zone without a distance limit is the city's fallback zone.
  const zone = zones.find((candidate) => candidate.maxDistanceKm == null || (distanceKm != null && distanceKm <= candidate.maxDistanceKm)) ?? null;
  if (!zone) {
    return { fee: MIN_DELIVERY_FEE, zoneId: null, zoneName: null, distanceKm };
  }

  const calculated = zone.baseFee + (distanceKm != null ? distanceKm * zone.pricePerKm : 0);
  return { fee: Math.max(MIN_DELIVERY_FEE, Math.ceil(calculated / 100) * 100), zoneId: zone.id, zoneName: zone.name, distanceKm };
}
