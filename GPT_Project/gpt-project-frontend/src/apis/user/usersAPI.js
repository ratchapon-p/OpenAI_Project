import axios from "axios"


//Registration

export const registerAPI = async(userData)=>{
    const response = await axios.post('http://localhost:8090/api/v1/users/register',
    {        
    email: userData?.email,
    password: userData?.password,
    username: userData?.username
    },{
        withCredentials: true
    })
    return response?.data;

}

//Login

export const loginAPI = async(userData)=>{
    const response = await axios.post('http://localhost:8090/api/v1/users/login',
    {        
    email: userData?.email,
    password: userData?.password,
    },{
        withCredentials: true
    })
    return response?.data;

}
