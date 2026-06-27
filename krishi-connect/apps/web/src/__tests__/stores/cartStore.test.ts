import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../stores/cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add an item to the cart', () => {
    const product = { id: 'p1', name: 'Seeds', price: 100, images: ['img1.jpg'] };
    useCartStore.getState().addItem(product);
    
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].productId).toBe('p1');
    expect(items[0].quantity).toBe(1);
  });

  it('should increment quantity if same item is added', () => {
    const product = { id: 'p1', name: 'Seeds', price: 100, images: ['img1.jpg'] };
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem(product);
    
    const items = useCartStore.getState().items;
    expect(items[0].quantity).toBe(2);
  });

  it('should calculate subtotal correctly', () => {
    useCartStore.getState().addItem({ id: 'p1', name: 'S1', price: 100 });
    useCartStore.getState().addItem({ id: 'p2', name: 'S2', price: 250 });
    
    expect(useCartStore.getState().getSubtotal()).toBe(350);
  });

  it('should calculate delivery charges (₹60 if < ₹500)', () => {
    useCartStore.getState().addItem({ id: 'p1', name: 'S1', price: 400 });
    expect(useCartStore.getState().getDeliveryCharges()).toBe(60);
    
    useCartStore.getState().addItem({ id: 'p2', name: 'S2', price: 200 });
    expect(useCartStore.getState().getDeliveryCharges()).toBe(0); // Free above 500
  });
});
