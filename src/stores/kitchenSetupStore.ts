import { create } from 'zustand';

export type Location = {
  address: string;
  latitude: number;
  longitude: number;
  raw: Record<string, any>;
};

export type SetupKitchenState = {
  kitchenName: string;
  kitchenType: string;
  contactNumber: string;
  businessEmail: string;
  location: Location;
};

export type SetupBusinessState = {
  panNumber: string;
  idProof: Record<string, any>;
  gstNumber?: string;
};

export type SetupBankState = {
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
  upiId: string;
};

export type SetupBusinessPhotoState = {
  businessPhoto: Record<string, any>;
};

export type KitchenRegistrationStore = {
  setupKitchen: SetupKitchenState;
  setupBusiness: SetupBusinessState;
  setupBank: SetupBankState;
  setupBusinessPhoto: SetupBusinessPhotoState;

  setSetupKitchen: (value: SetupKitchenState) => void;
  setSetupBusiness: (value: SetupBusinessState) => void;
  setSetupBank: (value: SetupBankState) => void;
  setSetupBusinessPhoto: (value: SetupBusinessPhotoState) => void;
  getCombined: () => SetupKitchenState & SetupBusinessState & SetupBankState & SetupBusinessPhotoState;
  reset: () => void;
};

const DEFAULT_SetupKitchen: SetupKitchenState = {
  kitchenName: '',
  kitchenType: '',
  contactNumber: '',
  businessEmail: '',
  location: {
    address: '',
    latitude: NaN,
    longitude: NaN,
    raw: {},
  },
};

const DEFAULT_SetupBusiness: SetupBusinessState = {
  panNumber: '',
  idProof: {},
  gstNumber: '',
};

const DEFAULT_SetupBank: SetupBankState = {
  bankName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifsc: '',
  upiId: '',
};

const DEFAULT_SetupBusinessPhoto: SetupBusinessPhotoState = {
  businessPhoto: {},
};

const useRegistrationKitchen = create<KitchenRegistrationStore>((set, get) => ({ 
    setupKitchen: DEFAULT_SetupKitchen,
    setupBusiness: DEFAULT_SetupBusiness,
    setupBank: DEFAULT_SetupBank,
    setupBusinessPhoto: DEFAULT_SetupBusinessPhoto,

    setSetupKitchen: (value)=>set((s) => ({ setupKitchen: { ...s.setupKitchen, ...value } })),
    setSetupBusiness: (value)=>set((s) => ({setupBusiness: {...s.setupBusiness, ...value }})),
    setSetupBank: (value)=>set((s) => ({setupBank: {...s.setupBank, ...value }})),
    setSetupBusinessPhoto: (value)=>set((s) => ({setupBusinessPhoto: {...s.setupBusinessPhoto, ...value }})),
    getCombined: () => {
        const state = get();
        return {
            ...state.setupKitchen,
            ...state.setupBusiness,
            ...state.setupBank,
            ...state.setupBusinessPhoto,
        }
    },
    reset: ()=>set({
        setupKitchen: DEFAULT_SetupKitchen,
        setupBusiness: DEFAULT_SetupBusiness,
        setupBank: DEFAULT_SetupBank,
        setupBusinessPhoto: DEFAULT_SetupBusinessPhoto,
    })
 }))  

export default useRegistrationKitchen;
