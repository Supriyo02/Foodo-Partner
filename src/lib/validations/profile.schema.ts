import * as yup from 'yup';

export const faqSchema = yup.object({
    topic: yup.string().required('Please select Topic type'),
    subject: yup.string().required('Subject is required'),
    description: yup.string().required('Description is required'),
}).required();