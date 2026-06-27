import {
  PrismaClient,
  Role,
  ApprovalStatus,
  ServiceCategory,
  RateType,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  ProductCategory,
  OrderStatus,
} from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const PASSWORDS = {
  admin: 'Admin@123',
  provider: 'Provider@123',
  farmer: 'Farmer@123',
}

// Thirthahalli, Shivamogga district, Karnataka — center: ~13.6906°N, 75.2426°E
// Coordinates per village in/around Thirthahalli, with rough straight-line
// distance from Thirthahalli town in km (used to tune the nearby-service tests).
const VILLAGES: Record<string, { lat: number; lng: number; pincode: string; kmFromTirth: number }> = {
  Thirthahalli:    { lat: 13.6906, lng: 75.2426, pincode: '577432', kmFromTirth: 0 },
  Hanagere:        { lat: 13.6970, lng: 75.2750, pincode: '577432', kmFromTirth: 4 },
  Konandur:        { lat: 13.6500, lng: 75.1900, pincode: '577432', kmFromTirth: 7 },
  Begar:           { lat: 13.7100, lng: 75.1900, pincode: '577432', kmFromTirth: 6 },
  Megaravalli:     { lat: 13.7400, lng: 75.2200, pincode: '577432', kmFromTirth: 6 },
  'Aramane Beedi': { lat: 13.6920, lng: 75.2480, pincode: '577432', kmFromTirth: 1 },
  Mandagadde:      { lat: 13.7019, lng: 75.2890, pincode: '577432', kmFromTirth: 5 },
  Koppa:           { lat: 13.5333, lng: 75.3500, pincode: '577126', kmFromTirth: 20 },
  Agumbe:          { lat: 13.5063, lng: 75.0934, pincode: '577411', kmFromTirth: 24 },
  Sringeri:        { lat: 13.4203, lng: 75.2553, pincode: '577139', kmFromTirth: 30 },
  Hosanagara:      { lat: 13.9214, lng: 75.0586, pincode: '577418', kmFromTirth: 32 },
}

// Tiny ±550 m jitter so seeded users in the same village aren't on the same pixel
const jitter = () => (Math.random() - 0.5) * 0.01

const PROVIDERS = [
  // ---- In 577432 (Thirthahalli catchment) — close to farmers ----
  {
    email: 'tirth.tractors@krishi.com',
    phone: '9845010101',
    firstName: 'Nagaraj',
    lastName: 'Bhat',
    businessName: 'Thirthahalli Town Tractors',
    village: 'Thirthahalli',
    categories: ['TRACTOR', 'ROTAVATOR', 'HARVESTING'],
    experience: 15,
    status: ApprovalStatus.APPROVED,
  },
  {
    email: 'konandur.labour@krishi.com',
    phone: '9845010102',
    firstName: 'Mahesh',
    lastName: 'Patil',
    businessName: 'Konandur Labour Co-op',
    village: 'Konandur',
    categories: ['LABOR', 'SPRAYING', 'HARVESTING'],
    experience: 9,
    status: ApprovalStatus.APPROVED,
  },
  {
    email: 'megaravalli.water@krishi.com',
    phone: '9845010103',
    firstName: 'Vinod',
    lastName: 'Hegde',
    businessName: 'Megaravalli Water Tankers',
    village: 'Megaravalli',
    categories: ['WATER_TANKER', 'IRRIGATION'],
    experience: 7,
    status: ApprovalStatus.APPROVED,
  },
  {
    email: 'ravi.tractor@krishi.com',
    phone: '9845010001',
    firstName: 'Ravi',
    lastName: 'Gowda',
    businessName: 'Ravi Tractor & Farm Services',
    village: 'Mandagadde',
    categories: ['TRACTOR', 'ROTAVATOR', 'HARVESTING'],
    experience: 12,
    status: ApprovalStatus.APPROVED,
  },
  // ---- Borderline (~20-24 km, just inside 25 km radius) ----
  {
    email: 'agumbe.irrigation@krishi.com',
    phone: '9845010003',
    firstName: 'Suresh',
    lastName: 'Hegde',
    businessName: 'Agumbe Ghat Irrigation',
    village: 'Agumbe',
    categories: ['IRRIGATION', 'WATER_TANKER'],
    experience: 6,
    status: ApprovalStatus.APPROVED,
  },
  {
    email: 'koppa.equipment@krishi.com',
    phone: '9845010004',
    firstName: 'Ganesh',
    lastName: 'Shetty',
    businessName: 'Koppa Equipment Rentals',
    village: 'Koppa',
    categories: ['EQUIPMENT', 'TRACTOR', 'ROTAVATOR'],
    experience: 10,
    status: ApprovalStatus.APPROVED,
  },
  // ---- Out of 25 km radius — should NOT show in 577432 nearby list ----
  {
    email: 'sringeri.harvest@krishi.com',
    phone: '9845010002',
    firstName: 'Manjunath',
    lastName: 'Bhat',
    businessName: 'Sringeri Harvest Solutions',
    village: 'Sringeri',
    categories: ['HARVESTING', 'LABOR', 'SPRAYING'],
    experience: 8,
    status: ApprovalStatus.APPROVED,
  },
  // ---- PENDING — should NOT appear in any nearby list ----
  {
    email: 'hosanagara.spray@krishi.com',
    phone: '9845010005',
    firstName: 'Prakash',
    lastName: 'Naik',
    businessName: 'Hosanagara Spray & Labour',
    village: 'Hosanagara',
    categories: ['SPRAYING', 'LABOR'],
    experience: 4,
    status: ApprovalStatus.PENDING,
  },
]

const FARMERS = [
  { email: 'shankar@krishi.com', phone: '9845020001', firstName: 'Shankar', lastName: 'Acharya',  village: 'Hanagere',      acres: 4.5 },
  { email: 'ramesh@krishi.com',  phone: '9845020002', firstName: 'Ramesh',  lastName: 'Bhandary', village: 'Begar',         acres: 7.2 },
  { email: 'ananya@krishi.com',  phone: '9845020003', firstName: 'Ananya',  lastName: 'Rao',      village: 'Mandagadde',    acres: 3.0 },
  { email: 'gopal@krishi.com',   phone: '9845020004', firstName: 'Gopal',   lastName: 'Pai',      village: 'Aramane Beedi', acres: 6.0 },
  { email: 'lakshmi@krishi.com', phone: '9845020005', firstName: 'Lakshmi', lastName: 'Kamath',   village: 'Megaravalli',   acres: 2.5 },
  { email: 'venkat@krishi.com',  phone: '9845020006', firstName: 'Venkat',  lastName: 'Hegde',    village: 'Konandur',      acres: 5.5 },
  { email: 'prema@krishi.com',   phone: '9845020007', firstName: 'Prema',   lastName: 'Shetty',   village: 'Sringeri',      acres: 4.0 },
  { email: 'kiran@krishi.com',   phone: '9845020008', firstName: 'Kiran',   lastName: 'Joshi',    village: 'Koppa',         acres: 8.0 },
]

// Services & products are linked to providers by email so reordering the
// PROVIDERS list above doesn't quietly break the references below.
const SERVICES = [
  // Thirthahalli town (in 577432 — should appear at top of nearby list)
  { providerEmail: 'tirth.tractors@krishi.com',     category: ServiceCategory.TRACTOR,    name: 'Mahindra 575 DI Tractor',       capacity: '47 HP',  rateType: RateType.PER_HOUR, price: 650,   fuelType: 'Diesel', desc: 'Powerful tractor ideal for paddy and arecanut fields. Fuel and operator included.' },
  { providerEmail: 'tirth.tractors@krishi.com',     category: ServiceCategory.ROTAVATOR,  name: 'Sonalika Rotavator (7 ft)',     capacity: '7 ft',   rateType: RateType.PER_ACRE, price: 1200,  fuelType: 'Diesel', desc: 'Wet-land rotavator suitable for paddy preparation in Malnad terrain.' },
  { providerEmail: 'tirth.tractors@krishi.com',     category: ServiceCategory.HARVESTING, name: 'Paddy Combine Harvester',       capacity: '14 ft',  rateType: RateType.PER_ACRE, price: 2800,  fuelType: 'Diesel', desc: 'Track-type combine harvester suited for slushy paddy fields of Thirthahalli.' },
  // Konandur (~7 km)
  { providerEmail: 'konandur.labour@krishi.com',    category: ServiceCategory.LABOR,      name: 'Farm Labour Team (5 workers)',  capacity: '5 men',  rateType: RateType.PER_DAY,  price: 2500,  fuelType: null,     desc: 'Daily-wage labour team for weeding, transplanting and general farm work.' },
  { providerEmail: 'konandur.labour@krishi.com',    category: ServiceCategory.SPRAYING,   name: 'Pesticide Spraying Service',    capacity: '2 men',  rateType: RateType.PER_ACRE, price: 800,   fuelType: null,     desc: 'Manual and power-spray service for arecanut, paddy and pepper.' },
  { providerEmail: 'konandur.labour@krishi.com',    category: ServiceCategory.HARVESTING, name: 'Areca Nut Plucker (with crew)', capacity: '4 men',  rateType: RateType.PER_DAY,  price: 4500,  fuelType: null,     desc: 'Trained climbers with safety gear for areca nut harvesting season.' },
  // Megaravalli (~5 km)
  { providerEmail: 'megaravalli.water@krishi.com',  category: ServiceCategory.WATER_TANKER, name: 'Water Tanker (5000 L)',       capacity: '5000 L', rateType: RateType.PER_TRIP, price: 900,   fuelType: 'Diesel', desc: 'Bore-water tanker for summer irrigation and emergency supply.' },
  { providerEmail: 'megaravalli.water@krishi.com',  category: ServiceCategory.IRRIGATION,  name: 'Drip Irrigation Setup',        capacity: '1 acre', rateType: RateType.PER_ACRE, price: 18000, fuelType: null,     desc: 'Complete drip system installation, ideal for arecanut gardens.' },
  // Mandagadde (~5 km)
  { providerEmail: 'ravi.tractor@krishi.com',       category: ServiceCategory.TRACTOR,    name: 'John Deere 5050D',              capacity: '50 HP',  rateType: RateType.PER_HOUR, price: 750,   fuelType: 'Diesel', desc: 'Heavy duty tractor with cultivator and trailer attachments.' },
  { providerEmail: 'ravi.tractor@krishi.com',       category: ServiceCategory.ROTAVATOR,  name: 'Shaktiman Rotavator',           capacity: '6 ft',   rateType: RateType.PER_ACRE, price: 1100,  fuelType: 'Diesel', desc: 'Heavy-duty rotavator for first ploughing of paddy fields.' },
  // Agumbe (~24 km, borderline)
  { providerEmail: 'agumbe.irrigation@krishi.com',  category: ServiceCategory.IRRIGATION,  name: 'Sprinkler Irrigation Service', capacity: '1 acre', rateType: RateType.PER_ACRE, price: 4500,  fuelType: null,     desc: 'Sprinkler-based irrigation for monsoon-shadow plots.' },
  // Koppa (~20 km)
  { providerEmail: 'koppa.equipment@krishi.com',    category: ServiceCategory.EQUIPMENT,  name: 'Power Tiller VST Shakti',       capacity: '13 HP',  rateType: RateType.PER_DAY,  price: 1800,  fuelType: 'Diesel', desc: 'Compact power tiller for hilly terrain and small plots.' },
  // Sringeri (~30 km, OUT of 25 km radius — won't show on nearby for 577432)
  { providerEmail: 'sringeri.harvest@krishi.com',   category: ServiceCategory.HARVESTING, name: 'Sringeri Crew Harvest',         capacity: '6 men',  rateType: RateType.PER_DAY,  price: 5200,  fuelType: null,     desc: 'Specialised harvest crew working around Sringeri taluk.' },
]

const PRODUCTS = [
  // Thirthahalli town
  { providerEmail: 'tirth.tractors@krishi.com',     category: ProductCategory.SEEDS,       name: 'MTU 1001 Paddy Seeds (10 kg)', brand: 'Karnataka Seed Corp', price: 850,   stock: 150, unit: 'bag',    desc: 'High-yielding paddy variety suited for Malnad rainfall pattern.' },
  { providerEmail: 'tirth.tractors@krishi.com',     category: ProductCategory.SEEDS,       name: 'Arecanut Sapling (1 yr)',      brand: 'CPCRI',               price: 80,    stock: 600, unit: 'sapling',desc: 'Disease-free Mangala variety arecanut sapling, one year old.' },
  { providerEmail: 'tirth.tractors@krishi.com',     category: ProductCategory.FERTILIZERS, name: 'Urea 50 kg',                   brand: 'IFFCO',               price: 268,   stock: 200, unit: 'bag',    desc: 'Subsidised urea fertiliser for paddy and arecanut.' },
  // Konandur
  { providerEmail: 'konandur.labour@krishi.com',    category: ProductCategory.PESTICIDES,  name: 'Bordeaux Mixture (5 kg)',      brand: 'Karnataka Agro',      price: 480,   stock: 80,  unit: 'pack',   desc: 'Copper-based fungicide for arecanut Koleroga (fruit rot).' },
  { providerEmail: 'konandur.labour@krishi.com',    category: ProductCategory.PESTICIDES,  name: 'Neem Oil (1 L)',               brand: 'Margo',               price: 320,   stock: 150, unit: 'bottle', desc: 'Organic neem oil pesticide, EPA approved.' },
  { providerEmail: 'konandur.labour@krishi.com',    category: ProductCategory.FERTILIZERS, name: 'DAP 50 kg',                    brand: 'IFFCO',               price: 1350,  stock: 120, unit: 'bag',    desc: 'Di-ammonium phosphate for basal application.' },
  // Megaravalli
  { providerEmail: 'megaravalli.water@krishi.com',  category: ProductCategory.IRRIGATION,  name: 'Drip Pipe 16 mm (100 m)',      brand: 'Jain Irrigation',     price: 1450,  stock: 90,  unit: 'roll',   desc: 'Inline dripper pipe with 30 cm spacing.' },
  { providerEmail: 'megaravalli.water@krishi.com',  category: ProductCategory.IRRIGATION,  name: 'Sprinkler Nozzle Set',         brand: 'Netafim',             price: 220,   stock: 200, unit: 'set',    desc: 'Brass impact sprinkler nozzle for medium-pressure systems.' },
  // Mandagadde
  { providerEmail: 'ravi.tractor@krishi.com',       category: ProductCategory.TOOLS,       name: 'Kodali (Pickaxe)',             brand: 'Local',               price: 380,   stock: 75,  unit: 'piece',  desc: 'Forged steel kodali with seasoned wooden handle.' },
  { providerEmail: 'ravi.tractor@krishi.com',       category: ProductCategory.TOOLS,       name: 'Sickle (Kudugolu)',            brand: 'Local',               price: 180,   stock: 120, unit: 'piece',  desc: 'Curved sickle for paddy harvesting.' },
  // Koppa
  { providerEmail: 'koppa.equipment@krishi.com',    category: ProductCategory.EQUIPMENT,   name: 'Knapsack Sprayer 16 L',        brand: 'Aspee',               price: 2400,  stock: 40,  unit: 'piece',  desc: 'Manual lever-operated sprayer with twin nozzle.' },
  { providerEmail: 'koppa.equipment@krishi.com',    category: ProductCategory.EQUIPMENT,   name: 'Power Weeder (Mini)',          brand: 'Honda',               price: 28500, stock: 12,  unit: 'piece',  desc: 'Petrol mini-tiller for plantation crops, 4-stroke engine.' },
]

async function main() {
  console.log('Starting Thirthahalli (Karnataka) seed...')

  // Schema-level helpers used by Booking/Order id columns.
  // Prisma's $executeRawUnsafe runs through a prepared statement, which
  // forbids multi-statement strings — so each command is sent separately.
  await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS booking_id_seq START 1000;`)
  await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1000;`)
  await prisma.$executeRawUnsafe(
    `CREATE OR REPLACE FUNCTION generate_booking_id() RETURNS TEXT AS $$
     BEGIN
       RETURN 'BK' || LPAD(NEXTVAL('booking_id_seq')::TEXT, 4, '0');
     END;
     $$ LANGUAGE plpgsql;`
  )
  await prisma.$executeRawUnsafe(
    `CREATE OR REPLACE FUNCTION generate_order_id() RETURNS TEXT AS $$
     BEGIN
       RETURN 'ORD' || LPAD(NEXTVAL('order_id_seq')::TEXT, 4, '0');
     END;
     $$ LANGUAGE plpgsql;`
  )

  // Wipe existing rows so the seed is idempotent
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.bookingTracking.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.product.deleteMany()
  await prisma.service.deleteMany()
  await prisma.address.deleteMany()
  await prisma.farmerProfile.deleteMany()
  await prisma.providerProfile.deleteMany()
  await prisma.user.deleteMany()

  const adminHash    = await bcrypt.hash(PASSWORDS.admin, 12)
  const providerHash = await bcrypt.hash(PASSWORDS.provider, 12)
  const farmerHash   = await bcrypt.hash(PASSWORDS.farmer, 12)

  // ---- Admin ----
  await prisma.user.create({
    data: {
      email: 'admin@krishiconnect.com',
      phone: '9000000000',
      password: adminHash,
      role: Role.ADMIN,
      firstName: 'Krishi',
      lastName: 'Admin',
      isVerified: true,
    },
  })

  // ---- Providers ----
  // Indexed by email so SERVICES/PRODUCTS can resolve their provider regardless
  // of insertion order.
  const providerByEmail: Record<string, { id: string; approvalStatus: ApprovalStatus }> = {}
  for (const p of PROVIDERS) {
    const v = VILLAGES[p.village]
    const u = await prisma.user.create({
      data: {
        email: p.email,
        phone: p.phone,
        password: providerHash,
        role: Role.SERVICE_PROVIDER,
        firstName: p.firstName,
        lastName: p.lastName,
        isVerified: p.status === ApprovalStatus.APPROVED,
        providerProfile: {
          create: {
            businessName: p.businessName,
            serviceCategories: p.categories,
            experience: p.experience,
            address: `${p.businessName}, ${p.village} Road`,
            city: p.village,
            state: 'Karnataka',
            pincode: v.pincode,
            latitude: v.lat + jitter(),
            longitude: v.lng + jitter(),
            serviceRadius: 30,
            approvalStatus: p.status,
            isOnline: true,
          },
        },
      },
      include: { providerProfile: true },
    })
    providerByEmail[p.email] = {
      id: u.providerProfile!.id,
      approvalStatus: u.providerProfile!.approvalStatus,
    }
  }

  // ---- Farmers ----
  const farmerProfiles = []
  for (const f of FARMERS) {
    const v = VILLAGES[f.village]
    const u = await prisma.user.create({
      data: {
        email: f.email,
        phone: f.phone,
        password: farmerHash,
        role: Role.FARMER,
        firstName: f.firstName,
        lastName: f.lastName,
        isVerified: true,
        farmerProfile: {
          create: {
            farmSize: f.acres,
            farmAddress: `${f.firstName} ${f.lastName}'s Farm, ${f.village}`,
            city: f.village,
            state: 'Karnataka',
            pincode: v.pincode,
            latitude: v.lat + jitter(),
            longitude: v.lng + jitter(),
            addresses: {
              create: {
                name: `${f.firstName} ${f.lastName}`,
                phone: f.phone,
                addressLine: `Door No. ${100 + Math.floor(Math.random() * 200)}, ${f.village} Village`,
                city: f.village,
                state: 'Karnataka',
                pincode: v.pincode,
                isDefault: true,
              },
            },
          },
        },
      },
      include: { farmerProfile: true },
    })
    farmerProfiles.push(u.farmerProfile!)
  }

  // ---- Services ----
  const serviceRows = []
  for (const s of SERVICES) {
    const provider = providerByEmail[s.providerEmail]
    if (!provider || provider.approvalStatus !== ApprovalStatus.APPROVED) continue
    const row = await prisma.service.create({
      data: {
        providerId: provider.id,
        category: s.category,
        name: s.name,
        description: s.desc,
        capacity: s.capacity,
        rateType: s.rateType,
        price: s.price,
        fuelType: s.fuelType,
        images: ['https://images.unsplash.com/photo-1594398911514-18d49c7a98b5?w=800'],
      },
    })
    serviceRows.push(row)
  }

  // ---- Products ----
  const productRows = []
  for (const p of PRODUCTS) {
    const provider = providerByEmail[p.providerEmail]
    if (!provider || provider.approvalStatus !== ApprovalStatus.APPROVED) continue
    const row = await prisma.product.create({
      data: {
        providerId: provider.id,
        name: p.name,
        description: p.desc,
        category: p.category,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        unit: p.unit,
        deliveryRange: 25,
        approvalStatus: ApprovalStatus.APPROVED,
        images: ['https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800'],
      },
    })
    productRows.push(row)
  }

  // ---- Bookings ----
  const bookingStatuses = [
    BookingStatus.REQUESTED,
    BookingStatus.ACCEPTED,
    BookingStatus.CONFIRMED,
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
  ]
  const today = new Date()
  for (let i = 0; i < 18; i++) {
    const service = serviceRows[i % serviceRows.length]
    const farmer = farmerProfiles[i % farmerProfiles.length]
    const status = bookingStatuses[i % bookingStatuses.length]
    const dayOffset = (i % 2 === 0 ? 1 : -1) * (i + 1)
    const bookingDate = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000)
    await prisma.booking.create({
      data: {
        farmerId: farmer.id,
        serviceId: service.id,
        providerId: service.providerId,
        bookingDate,
        startTime: ['08:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'][i % 4],
        duration: ['2 Hours', '4 Hours', '1 Day', 'Half Day'][i % 4],
        status,
        totalAmount: service.price.mul(i % 3 === 0 ? 1 : 4),
        paymentMethod: i % 2 === 0 ? PaymentMethod.UPI_ONLINE : PaymentMethod.CASH,
        paymentStatus:
          status === BookingStatus.COMPLETED
            ? PaymentStatus.PAID
            : status === BookingStatus.CANCELLED
            ? PaymentStatus.REFUNDED
            : PaymentStatus.PENDING,
      },
    })
  }

  // ---- Orders ----
  const orderStatuses = [
    OrderStatus.PLACED,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ]
  for (let i = 0; i < 14; i++) {
    const product = productRows[i % productRows.length]
    const farmer = farmerProfiles[i % farmerProfiles.length]
    const qty = (i % 3) + 1
    const subtotal = product.price.mul(qty)
    const delivery = 50
    await prisma.order.create({
      data: {
        farmerId: farmer.id,
        status: orderStatuses[i % orderStatuses.length],
        subtotal,
        deliveryCharges: delivery,
        totalAmount: subtotal.add(delivery),
        paymentMethod: i % 2 === 0 ? PaymentMethod.CASH : PaymentMethod.UPI_ONLINE,
        paymentStatus: i % 2 === 0 ? PaymentStatus.PENDING : PaymentStatus.PAID,
        deliveryAddress: {
          name: `${FARMERS[i % FARMERS.length].firstName} ${FARMERS[i % FARMERS.length].lastName}`,
          address: `${FARMERS[i % FARMERS.length].village} Village`,
          city: FARMERS[i % FARMERS.length].village,
          state: 'Karnataka',
          pincode: FARMERS[i % FARMERS.length].pincode,
          phone: FARMERS[i % FARMERS.length].phone,
        },
        items: {
          create: [
            {
              productId: product.id,
              quantity: qty,
              unitPrice: product.price,
              totalPrice: subtotal,
            },
          ],
        },
      },
    })
  }

  console.log('\nSeed completed.\n')
  console.log('Login credentials (Karnataka — Thirthahalli area, pincode 577432):')
  console.log('-------------------------------------------------------------------')
  console.log(`  ADMIN     admin@krishiconnect.com           / ${PASSWORDS.admin}`)
  console.log()
  console.log('  PROVIDERS (password: ' + PASSWORDS.provider + ')')
  console.log('    email                                 business — village                  km   status')
  for (const p of PROVIDERS) {
    const v = VILLAGES[p.village]
    const inRadius = v.kmFromTirth <= 25 && p.status === ApprovalStatus.APPROVED ? 'IN-RANGE' : ''
    console.log(
      `    ${p.email.padEnd(38)}  ${p.businessName.padEnd(32)} — ${p.village.padEnd(15)} ${String(v.kmFromTirth).padStart(3)}  [${p.status}] ${inRadius}`,
    )
  }
  console.log()
  console.log('  FARMERS (password: ' + PASSWORDS.farmer + ')')
  console.log('    email                            name              village           pincode  acres')
  for (const f of FARMERS) {
    const v = VILLAGES[f.village]
    console.log(
      `    ${f.email.padEnd(33)}  ${(f.firstName + ' ' + f.lastName).padEnd(17)} ${f.village.padEnd(17)} ${v.pincode}  ${f.acres}`,
    )
  }
  console.log()
  console.log('Nearby-service test:')
  console.log('  Log in as any 577432 farmer (e.g. shankar@krishi.com / Farmer@123).')
  console.log('  The dashboard "Nearby Services" panel runs Haversine within 25 km of the')
  console.log('  farmer\'s lat/lng and only returns APPROVED providers, so you should see')
  console.log('  services from Thirthahalli, Konandur, Megaravalli, Mandagadde, Koppa,')
  console.log('  and Agumbe — but NOT Sringeri (~30 km) or Hosanagara (PENDING).')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
