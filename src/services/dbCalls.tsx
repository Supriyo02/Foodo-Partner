import { Combo, MenuItem, PreviousMenu } from "@/types";



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