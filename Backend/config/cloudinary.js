import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"//jo vfile ayega usko hata dega cloudinary mey jo store ho jata h

const uploadOnCloudinary = async(filePath) => {
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET,
});
try{
    if(!filePath)
    return null;
    const result = await cloudinary.uploader.upload(filePath,{resource_type:'auto'}) //auto means image or video dono ho skta h
    fs.unlinkSync(filePath);
    return result.secure_url

} catch(error){
   console.log(error)
   fs.unlinkSync(filePath); 

}
}
export default uploadOnCloudinary