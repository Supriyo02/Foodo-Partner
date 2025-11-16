
import * as yup from 'yup';

const phoneRegex = /^\+?[0-9]{7,15}$/;


export const kitchenSchema1 = yup.object({
kitchenName: yup.string().required('Kitchen name is required').min(3, 'Too short'),
kitchenType: yup.string().required('Please select kitchen type'),
contactNumber: yup.string().required('Contact number is required').matches(phoneRegex, 'Invalid phone number').min(10, 'Too short'),
businessEmail: yup.string().required('Email is required').email('Enter a valid email'),
location: yup.object({
    address: yup.string().required('Location address is required'),
    latitude: yup.number().required('Latitude is required').typeError('Latitude must be a number'),
    longitude: yup.number().required('Longitude is required').typeError('Longitude must be a number'),
    raw: yup.object().optional() 
  }),
}).required();


export const kitchenSchema2 = yup.object({
    panNumber: yup.string().required('Pan details is required').min(10, 'Too short'),
    idProof: yup.mixed().required('Please upload an ID proof'),
    gstNumber: yup.string().optional(),
}).required();

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const upiRegex = /^[\w.\-]{2,256}@[a-zA-Z]{2,256}$/;

export const kitchenSchema3 = yup.object({
  bankName: yup.string().required('Bank name is required'),
  accountNumber: yup.string().required('Account number is required').matches(/^\d+$/, 'Account number must contain only digits').min(14, 'Account number must be 14 digits').max(14, 'Account number must be 14 digits'),
  confirmAccountNumber: yup.string().required('Please confirm account number').oneOf([yup.ref('accountNumber')], 'Account numbers do not match'),
  ifsc: yup.string().required('IFSC code is required').matches(ifscRegex, 'Invalid IFSC code'),
  upiId: yup.string().required('Please enter the UPI ID').matches(upiRegex, 'Invalid UPI ID'),
})
  .required();

  export const kitchenSchema4 = yup.object({
    businessPhoto: yup.mixed().nullable().required('Please upload an Business Photo'),
}).required();