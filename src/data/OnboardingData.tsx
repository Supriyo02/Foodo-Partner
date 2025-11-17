import { ImageSourcePropType } from "react-native";

export type ImageSliderType = {
    id: string,
    uri: ImageSourcePropType;
    title: string;
}

export const ImageSliderData = [
    {
        id: '1',
        title: 'Join Foodo Partners — your ease, our mission',
        uri: require('@/assets/images/onboarding/slide1.jpg'),
    },
    {
        id: '2',
        title: 'Manage orders easily, boost your kitchen efficiency',
        uri: require('@/assets/images/onboarding/slide3.jpg'),
    },
    {
        id: '3',
        title: 'Connect with customers and serve them faster',
        uri: require('@/assets/images/onboarding/slide2.jpg'),
    },
    {
        id: '4',
        title: 'Track sales, insights, and performance in real time',
        uri: require('@/assets/images/onboarding/slide4.jpg'),
    },
    {
        id: '5',
        title: 'Grow your business with Foodo Partners today',
        uri: require('@/assets/images/onboarding/slide5.jpg'),
    },
]