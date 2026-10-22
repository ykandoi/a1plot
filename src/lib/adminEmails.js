// Single shared source for admin identification — mirrors firestore.rules'
// isAdmin() emails exactly. Kept in its own module (rather than only living
// inline in ClientApp.jsx) so other client code, like useValuationRates.js,
// can check admin status without importing the whole SPA component.
export const ADMIN_EMAILS = ['kdy20330@gmail.com', 'ykandoi20330@gmail.com'];
