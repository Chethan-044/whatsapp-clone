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

        

        const populatedStatus = await status.findOne(newStatus._id)
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture")

        //emit socket event to update status in real time
        if(req.io && req.socketUserMap){

            for(const [connecteduserId , socketId] of req.socketUserMap){
                if(connecteduserId !== userId.toString()){
                    req.io.to(socketId).emit("new_status", populatedStatus);
                }
            }
        }

        return response(res,201,"status created successfully",populatedStatus);
    } catch (error) {
        console.error(error);
        return response(res,500,'Internal server error')

        
    }
}



exports.getStatus = async(req,res)=>{
    try{
        const statuses = await status.find({
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
        const Status = await status.findById(statusId);

        if(!Status){
            return response(res,404,'status not found');
        }
        if(!Status.viewers.includes(userId)){
            Status.viewers.push(userId);
            await Status.save();

             const updatedStatus = await status.findById(statusId)
            .populate("user", "username profilePicture")
            .populate("viewers","username profilePicture")

            // emit socket event to update status views in real time
            if(req.io && req.socketUserMap){

                const statusOwnerSocketId = req.socketUserMap.get(Status.user._id.toString());
                if(statusOwnerSocketId){
                    const viewData = {
                        statusId,
                        viewerId:userId,
                        totalViewers: updatedStatus.viewers.length,
                        viewers: updatedStatus.viewers
                    }
                    req.io.to(statusOwnerSocketId).emit("status_viewed", viewData);
                }
                else{
                    console.log("Status owner is not online, cannot emit view update");
                }
        }

        }else{
            console.log("User has already viewed this status");
        }

        return response(res,200,"status viewed successfully")
        
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

        //emit socket event to remove status in real time

         if(req.io && req.socketUserMap){

            for(const [connecteduserId , socketId] of req.socketUserMap){
                if(connecteduserId !== userId.toString()){
                    req.io.to(socketId).emit("status_deleted", { statusId });
                }
            }
        }

        return response(res,200,"status deleted successfully")
    } catch (error) {
        console.error(error);
        return response(res,400,'Internal server error')
    }
}