


export const sendOtp = async (phoneNumber: string) =>{
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Phone number: ", phoneNumber)
    return 200;
}

export const verifyOtp = async(otp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Phone number: ", otp);
    return 200;
}

export const formSubmit = async(data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Phone number: ", data);
    return 200;
}