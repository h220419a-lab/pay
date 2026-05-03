# Manual Test Checklist

## Authentication

- Register with a new email address
- Login with the registered account
- Confirm invalid credentials are rejected

## Store

- View seeded products
- Add multiple products to cart
- Update quantity
- Remove a cart item

## Checkout

- Confirm checkout is blocked when not logged in
- Confirm empty cart checkout is rejected
- Start checkout and verify redirect URL is returned from Paynow

## Paynow

- Confirm `callback` rejects invalid hashes
- Confirm valid callback updates `PaymentStatus`
- Confirm `refresh-status` polls `pollurl`

## Orders

- Confirm new order appears after checkout
- Confirm payment status changes after callback or manual refresh
