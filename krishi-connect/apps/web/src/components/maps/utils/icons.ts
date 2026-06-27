import L from 'leaflet';

export const createPriceIcon = (price: string) => {
  return L.divIcon({
    className: 'custom-price-marker',
    html: `<div class="bg-primary text-white px-2 py-1 rounded-lg font-black text-[10px] shadow-lg border-2 border-white ring-1 ring-primary/20 transition-transform active:scale-95">₹${price}</div>`,
    iconSize: [40, 24],
    iconAnchor: [20, 24],
    popupAnchor: [0, -24],
  });
};

export const farmerIcon = L.divIcon({
  className: 'farmer-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-20"></div>
      <div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const providerIcon = (avatarUrl?: string) => {
  return L.divIcon({
    className: 'provider-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-10 h-10 bg-green-500 rounded-full animate-ping opacity-10"></div>
        <div class="relative w-8 h-8 bg-white rounded-full border-2 border-primary shadow-xl overflow-hidden">
          ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />` : `<div class="w-full h-full bg-green-50 flex items-center justify-center text-primary font-black text-[10px]">P</div>`}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};
