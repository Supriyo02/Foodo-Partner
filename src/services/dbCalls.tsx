import { AddCombo, AddItem, Combo, FaqContactDetails, MenuItem, NotificationItem, OrderCardType, PreorderSection, PreviousMenu, RawLocation, TimeSlot } from "@/types";
import { initialStaticSlots } from "../data/orderData";
import { uuidv4 } from "./utility";
import { notificationsData } from "../data/inboxData";



export const sendOtp = async (phoneNumber: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Phone number: ", phoneNumber)
    return 200;
}

export const verifyOtp = async (otp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Phone number: ", otp);
    return 200;
}

export const formSubmit = async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // console.log("Phone number: ", data);
    return 200;
}

export const fetchMenuItems = async () => {
    await new Promise(r => setTimeout(r, 2000));


    return [
        {
            id: '1',
            name: 'Classic Beef Burger',
            description: 'Juicy grilled beef patty with cheese',
            price: 12.5,
            status: 'available',
            image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
        },
        {
            id: '2',
            name: 'Spaghetti Bolognese',
            description: 'Slow-cooked meat sauce with spaghetti',
            price: 14.0,
            status: 'low_stock',
            image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
        },
        {
            id: '3',
            name: 'Vegan Rainbow Bowl',
            description: 'Seasonal veggies, grains & dressing',
            price: 15.5,
            status: 'sold_out',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        },
        {
            id: '4',
            name: 'Margherita Pizza',
            description: 'Classic margherita with fresh basil',
            price: 11.0,
            status: 'available',
            image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
        },
    ];
};


const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const menuService = {
    fetchItems: async (): Promise<MenuItem[]> => {
        await wait(220);
        return [
            { id: 'i1', name: 'Classic Burger', description: 'Juicy grilled beef patty', price: 12.5, status: 'available', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
            { id: 'i2', name: 'Spaghetti Bolognese', description: 'Slow-cooked meat sauce', price: 14.0, status: 'low_stock', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80' },
            { id: 'i3', name: 'Margherita Pizza', description: 'Classic cheese & basil', price: 11.0, status: 'sold_out', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80' },
        ];
    },
    fetchCombos: async (): Promise<Combo[]> => {
        await wait(220);
        return [
            { id: 'c1', name: 'Burger + Fries', items: ['Classic Beef Burger', 'Fries'], price: 16.0, image: '', status: 'available' },
            { id: 'c2', name: 'Family Pizza Pack', items: ['Margherita Pizza', 'Pepperoni Pizza'], price: 28.0, image: '', status: 'available' },
        ];
    },
    fetchPreviousMenus: async (): Promise<PreviousMenu[]> => {
        await wait(220);
        return [
            { id: 'p1', title: 'Menu - May 2025', createdAt: '2025-05-03' },
            { id: 'p2', title: 'Menu - April 2025', createdAt: '2025-04-01' },
        ];
    }
};

export async function fetchCombosName(): Promise<AddCombo[]> {
  return new Promise((res) =>
    setTimeout(
      () =>
        res([
          { id: "c1", name: "Main Course" },
          { id: "c2", name: "Dessert" },
          { id: "c3", name: "Sides" },
        ]),
      150
    )
  );
}

export async function fetchItemsName(): Promise<AddItem[]> {
  return new Promise((res) =>
    setTimeout(
      () =>
        res([
          { id: "i1", name: "Chicken Biryani" },
          { id: "i2", name: "Mutton Korma" },
          { id: "i3", name: "Gulab Jamun" },
          { id: "i4", name: "Naan" },
        ]),
      150
    )
  );
}

export const fetchIncomingOrders = async (): Promise<OrderCardType[]> => {
  await new Promise(res => setTimeout(res, 300));
  return [
    {
      id: 'in_1',
      customer: 'John D.',
      itemsSummary: '2x Classic Burger, 1x Fries, 1x Coke',
      total: '25.50',
      meta: 'Prep Time: 15 min',
      deliveryLocation: '22 Baker St, Apt 4B',
    },
    {
      id: 'in_2',
      customer: 'Jane S.',
      itemsSummary: '1x Veggie Wrap, 1x Salad, +2 more',
      total: '18.75',
      meta: 'Delivery By: 6:45 PM',
      deliveryLocation: '12 Green Ave',
    },
  ];
};

export const fetchPreparingOrders = async (): Promise<OrderCardType[]> => {
  await new Promise(res => setTimeout(res, 250));
  return [
    {
      id: 'pre_1',
      customer: 'John D.',
      itemsSummary: '2x Margherita Pizza, 1x Garlic Bread',
      total: '25.50',
      placedAt: 'Placed at 12:05 PM', //Placed at 
      deliveryLocation: '22 Baker St, Apt 4B',
    },
  ];
};

export const fetchOutForDeliveryOrders = async (): Promise<OrderCardType[]> => {
  await new Promise(res => setTimeout(res, 220));
  return [
    {
      id: 'out_1',
      customer: 'Emily C.',
      itemsSummary: '1x Pepperoni Pizza, 1x Coke',
      total: '$18.50',
      placedAt: 'Out for delivery at 11:45 AM',
      deliveryLocation: '55 Lakeview Rd',
    },
  ];
};

export const fetchDeliveredOrders = async (): Promise<OrderCardType[]> => {
  await new Promise(res => setTimeout(res, 120));
  return [];
};

const SAMPLE_IMAGE_URI = "https://img.freepik.com/free-psd/roasted-chicken-dinner-platter-delicious-feast_632498-25445.jpg?semt=ais_hybrid&w=740&q=80";

export async function fetchPreordersForDate(dateISO: string): Promise<PreorderSection[]> {
  await new Promise((r) => setTimeout(r, 80));
  return [
    {
      id: "tiffin",
      title: "Tiffin",
      itemCount: 2,
      expanded: false,
      items: [
        { id: "t1", name: "Veg Sandwitch", qty: 3, image: SAMPLE_IMAGE_URI },
        { id: "t2", name: "Chowmin", qty: 5, image: SAMPLE_IMAGE_URI },
      ],
    },
    {
      id: "lunch",
      title: "Lunch",
      itemCount: 3,
      expanded: true,
      items: [
        { id: "l1", name: "Rice", qty: 15, image: SAMPLE_IMAGE_URI },
        { id: "l2", name: "Dal", qty: 12, image: SAMPLE_IMAGE_URI },
        { id: "l3", name: "Posto", qty: 12, image: SAMPLE_IMAGE_URI },
      ],
    },
    {
      id: "dinner",
      title: "Dinner",
      itemCount: 3,
      expanded: false,
      items: [
        { id: "l1", name: "Rice", qty: 15, image: SAMPLE_IMAGE_URI },
        { id: "l2", name: "Dal", qty: 12, image: SAMPLE_IMAGE_URI },
        { id: "l3", name: "Posto", qty: 12, image: SAMPLE_IMAGE_URI },
      ],
    },
  ];
}

export const fetchTimeSlots = async (): Promise<TimeSlot[]> => {
  await new Promise((r) => setTimeout(r, 80));
  return JSON.parse(JSON.stringify(initialStaticSlots));
};

export const addTimeSlot = async (payload: Omit<TimeSlot, "id">): Promise<TimeSlot> => {
  await new Promise((r) => setTimeout(r, 80));
  return { ...payload, id: uuidv4() };
};

export const updateTimeSlot = async (id: string, patch: Partial<TimeSlot>): Promise<TimeSlot> => {
  await new Promise((r) => setTimeout(r, 80));
  // merge with id last to avoid duplicate-id TypeScript warning
  const merged: TimeSlot = {
    ...(patch as Partial<TimeSlot>),
    id,
  } as TimeSlot;
  return merged;
};

export const deleteTimeSlot = async (id: string) => {
  await new Promise((r) => setTimeout(r, 80));
};


export const fetchDeliverySettings = async (): Promise<{ distance: number; areas: RawLocation[] }> =>
  new Promise((res) =>
    setTimeout(
      () =>
        res({
          distance: 5,
          areas: [
            { address: "Koramangala, 560034", latitude: 12.9352, longitude: 77.6245, raw: {} },
            { address: "HSR Layout, 560102", latitude: 12.9106, longitude: 77.6411, raw: {} },
            { address: "Indiranagar, 560038", latitude: 12.9718, longitude: 77.6413, raw: {} },
          ],
        }),
      300
    )
  );

export const addDefinedArea = async (loc: RawLocation): Promise<RawLocation> =>
  new Promise((res) => setTimeout(() => res(loc), 250));

export const removeDefinedArea = async (address: string): Promise<{ removed: boolean }> =>
  new Promise((res) => setTimeout(() => res({ removed: true }), 200));

export const updateMaxDistance = async (distance: number): Promise<{ ok: boolean }> =>
  new Promise((res) => setTimeout(() => res({ ok: true }), 200));

export const submitDeliverySettings = async (payload: {
  distance: number;
  definedAreas: RawLocation[];
}): Promise<{ ok: boolean }> =>
  new Promise((res) => {
    // simulate server logging
    console.log("submitDeliverySettings payload:", payload);
    setTimeout(() => res({ ok: true }), 400);
  });

export async function fetchNotifications(): Promise<NotificationItem[]> {
  await new Promise((r) => setTimeout(r, 120));
  // return a copy so callers can mutate safely
  return notificationsData.map((i) => ({ ...i }));
}

export async function markNotificationAsRead(id: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 160));
  // In real implementation, call server to mark as read
  return { ok: true };
}

const DEFAULT_AVATAR = 'https://hips.hearstapps.com/hmg-prod/images/edc100124gambrel-006-66e0bc34ac150.jpg?crop=0.688xw:1.00xh;0.276xw,0&resize=1200:*';

export async function fetchProfile() {
  // simulated async fetch
  return Promise.resolve({
    businessName: 'The Cozy Kitchen',
    tagline: 'Italian • Home style',
    address: '123 Gourmet Lane, Foodville',
    email: 'hello@cozykitchen.com',
    avatar: DEFAULT_AVATAR,
  });
}


export async function fetchSettings() {
  return Promise.resolve({
    notificationsEnabled: true,
    language: 'English',
  });
}

export async function saveSettings(payload: {notificationsEnabled?: boolean; language?: string}) {
  // persist later; for now just resolve
  console.log('saveSettings called', payload);
  return Promise.resolve({ok: true});
}

export async function logoutUser() {
  // TODO: call backend logout or clear tokens
  return Promise.resolve({ok: true});
}

export async function fetchContactDetails(): Promise<FaqContactDetails> {
  // replace with your real DB/network call later
  return Promise.resolve({
    email: 'support@foodo.com',
    phone: '+91 9725640000',
  });
}

export const faqFormSubmit = async (data: object) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Form Data: ", data)
    return 200;
}