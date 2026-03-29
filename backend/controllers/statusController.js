const response = require('../utils/responseHandler.js'); // adjust path as neededconst { uploadFileToCloudinary } = require("../config/cloudinary");
const status = require("../models/status.js");
const Message = require("../models/Message");
const {uploadFileToCloudinary} = require("../config/cloudinary.js")




exports.sendMessage = async(req,res)=>{
    try {
        const { content , contentType} = req.body;
        const userId = req.user.userId;
        const file = req.file;

        let mediaUrl = null;
        let finalContentType = contentType||'text';

        if(file){
            const uploadFile = await uploadFileToCloudinary(file);

            if(!uploadFile?.secure_url){
                return response(res,400,"Failed to upload media")
            }
            mediaUrl = uploadFile?.secure_url;

            if(file.mimetype.startsWith('image')){
                finalContentType='image'
            }else if(file.mimetype.startWith('video')){
                finalContentType='video'
            }else{
                return response(res,400,'unsupported file type')
            }

            
        }else if(content?.trim()){
            finalContentType='text'
        }else{
            return response(res,400,'Message content is required')
           
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // status expires in 24 hours

        const newStatus = new status({
            user:userId,
            content:mediaUrl || content,
            contentType:finalContentType,
            expiresAt
        })
        await newStatus.save();

        

        const populatedStatus = await Status.findOne(status?._id)
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture")


        return response(res,201,"status created successfully");
    } catch (error) {
        console.error(error);
        return response(res,500,'Internal server error')

        
    }
}



exports.getStatus = async(req,res)=>{
    try{
        const statuses = await Status.find({
            expiresAt: {$gt: new Date()}
        }).populate("user", "username profilePicture")
        .populate("viewers","username profilePicture")
        .sort({ createdAt: -1 })

        return response(res,200,"statuses retrieved successfully", statuses);
    }catch(error){
        console.error(error);
        return response(res,500,'Internal server error')
    }
}

exports.viewStatus = async(req,res)=>{
    try{
        const {statusId}= req.params;
        const userId = req.user.userId;
        const status = await Status.findById(statusId);

        if(!status){
            return response(res,404,'status not found');
        }
        if(!status.viewers.includes(userId)){
            status.viewers.push(userId);
            await status.save();

            const updatedStatus = await Status.findById(statusId)
            .populate("user", "username profilePicture")
            .populate("viewers","username profilePicture")

            return response(res,200,"status viewed successfully")

        }else{
            return response(res,200,"status already viewed")
        }
        
    } catch (error) {
        console.error(error);
        return response(res,500,'Internal server error')
    }
}

exports.deleteStatus = async(req,res)=>{
    try{
          const {statusId}= req.params;
        const userId = req.user.userId;
        const status = await Status.findById(statusId);

         if(!status){
            return response(res,404,'status not found');
        }
        if(status.user.toString() !== userId) 
            return response(res,403,'Not authorized to delete this status');

        await Status.deleteOne();

        return response(res,200,"status deleted successfully")
    } catch (error) {
        console.error(error);
        return response(res,400,'Internal server error')
    }
}