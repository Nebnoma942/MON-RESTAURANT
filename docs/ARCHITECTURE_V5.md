# Architecture V5 — Restaurant Burkina Faso

## Order lifecycle
Client/guest -> pending -> restaurant confirmed -> preparing -> ready -> driver dispatch -> delivering -> delivered.

The restaurant cannot directly set delivery-side statuses. When a restaurant marks an order `ready`, the API automatically attempts to assign the nearest available online driver. If none is available, the order remains `ready` and an admin can retry dispatch.

## Guest checkout
Guests do not get an account automatically. They provide name and phone, and receive a tracking token on the created order.

## Delivery pricing
The order stores the quoted delivery fee, zone and distance. The client may provide GPS coordinates; the server calculates the fee from configured delivery zones.

## Payments
Orange Money, Moov Money and cash are represented as payment methods. Mobile-money transactions remain `pending` until a real payment gateway/webhook is integrated. No hard-coded merchant number is considered a production payment integration.

## Four applications
- Client: `artifacts/mobile`
- Restaurant: `artifacts/restaurant-app`
- Driver: `artifacts/driver-app`
- Admin: `artifacts/admin`
- Shared API: `artifacts/api-server`
- Shared PostgreSQL/Drizzle schema: `lib/db`
