
import * as yup from 'yup';

const phoneRegex = /^\+?[0-9]{7,15}$/;


export const kitchenSchema1 = yup.object({
kitchenName: yup.string().required('Kitchen name is required').min(3, 'Too short'),
kitchenType: yup.string().required('Please select kitchen type'),
contactNumber: yup.string().required('Contact number is required').matches(phoneRegex, 'Invalid phone number'),
businessEmail: yup.string().required('Business email is required').email('Enter a valid email'),
address: yup.string().required('Address is required'),
// panNumber: yup.string().required('Pan details is required').min(10, 'Too short').max(10, 'Too short'),
// idProof: yup.mixed().nullable().required('Please upload an ID proof'),
}).required();