import * as yup from 'yup';

export const addItemSchema = yup.object({
    itemPhoto: yup.mixed().nullable().required('Please upload the Item Photo'),
    name: yup.string().required('Item name is required'),
    description: yup.string().optional(),
    itemType: yup.string().required('Please select Item Category'),
    price: yup.number().required("Item price is required"),
    isAvailable: yup.boolean().required(),
    stockQuantity: yup.number().optional(),
}).required();