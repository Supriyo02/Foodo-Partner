
import * as yup from 'yup';

const phoneRegex = /^\+?[0-9]{7,15}$/;


export const kitchenSchema1 = yup.object({
kitchenName: yup.string().required('Kitchen name is required').min(3, 'Too short'),
kitchenType: yup.string().required('Please select kitchen type'),
contactNumber: yup.string().required('Contact number is required').matches(phoneRegex, 'Invalid phone number').min(10, 'Too short'),
businessEmail: yup.string().required('Email is required').email('Enter a valid email'),
// panNumber: yup.string().required('Pan details is required').min(10, 'Too short').max(10, 'Too short'),
// idProof: yup.mixed().nullable().required('Please upload an ID proof'),
location: yup.object({
    address: yup.string().required('Location address is required'),
    latitude: yup.number().required('Latitude is required').typeError('Latitude must be a number'),
    longitude: yup.number().required('Longitude is required').typeError('Longitude must be a number'),
    raw: yup.object().optional() 
  }),
}).required();