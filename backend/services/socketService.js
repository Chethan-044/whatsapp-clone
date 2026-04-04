const {Server} = require('socket.io');
const User = require('../models/User')
const Message = require("../models/Message")

//map to store online users and their corresponding socket IDs
const onlineUsers = new Map();

//map to store users who are currently typing in a conversation
const typingUsers = new Map();


const initializeSocket = (server) => {
    const io = new Server(server , {
        cors:{
            origin:process.env.FRONTEND_URL,
            credentials:true,
            methods:['GET','POST','PUT','DELETE','OPTIONS'],
            
        },
        pingTimeout:60000 
    });

    //when a client connects to the socket
    io.on('connection',(socket)=>{
        console.log('A user connected: ' + socket.id);
        let userId = null;

        //handle user connection and mark them as online
        socket.on('user_connected', async (connectingUserId) => {
           try{
             userId = connectingUserId;
            onlineUsers.set(userId, socket.id);
            socket.join(userId); //join a room with the user's ID for private messaging
            
            //update user's online status in the database
            await User.findByIdAndUpdate(userId, { 
                isOnline: true,
                lastSeen: new Date()
            });

            //notify all user that this user is now online
            io.emit('user_status',{userId , isOnline:true});

        }catch(err){
            console.log('Error in user connection socket',error);   
        }
        })

    //Return online status of a requested user
        socket.on("get_user_status",(requestedUserId,callback)=>{
            const isOnline = onlineUsers.has(requestedUserId);
            callback({userId:requestedUserId,   
                isOnline,
            lastSeen: isOnline ? null : new Date() //if user is offline, return last seen time});
        })

        })


    //handle user disconnection and mark them as offline
        socket.on("send_message",async(message)=>{
            try {
                const receiverSocketId = onlineUsers.get(message.receiver?.id);
                if(receiverSocketId){
                    io.to(receiverSocketId).emit("receive_message",message);
                }
            } catch (error) {
                console.log('Error in sending message',error);
                socket.emit("message_error",{error:"Failed to send message"})
            }
        })

    //update message as read and notify the sender
        socket.on("message_read",async({messageIds,senderId})=>{
            try {
                await Message.updateMany(
                    {_id:{$in:messageIds}},
                    {$set:{messageStatus:"read"}}
                )

                const senderSocketId = onlineUsers.get(senderId);
                if(senderSocketId){
                    messageIds.forEach(messageId=>{
                        io.to(senderSocketId).emit("message_status_update",{
                            messageId,
                            messageStatus:"read"
                        }
                    )
                    })
                }

            } catch (error) {
                console.log('Error in updating message status',error);
            }
        })


    //handle typing start event and auto-stop after 3s
        socket.on("typing_start",({conversationId,receiverId})=>{
            if(!userId || !conversationId || !receiverId) return;

            if(!typingUsers.has(userId)) typingUsers.set(userId,{});

            const userTyping = typingUsers.get(userId);
            userTyping[conversationId] = true;

            //clear any exisiting timeout
            if(userTyping[`${conversationId}_timeout`]){
                clearTimeout(userTyping[`${conversationId}_timeout`]);
            }
            //auto-stop after 3s
            userTyping[`${conversationId}_timeout`] = setTimeout(()=>{
                userTyping[conversationId] = false;
                socket.to(receiverId).emit("user_typing",{
                    userId,
                    conversationId,
                    isTyping:false
                })
            },3000)

            //Notify receiver
            socket.to(receiverId).emit("user_typing",{
                userId,
                conversationId,
                isTyping:true
            })
        })

        socket.on("typing_stop",({conversationId,receiverId})=>{
            if(!userId || !conversationId || !receiverId) return;

            if(typingUsers.has(userId)){
                const userTyping= typingUsers.get(userId);
                userTyping[conversationId] = false;

                //clear any existing timeout
                if(userTyping[`${conversationId}_timeout`]){
                    clearTimeout(userTyping[`${conversationId}_timeout`]);
                    delete userTyping[`${conversationId}_timeout`];
                }
            }

            socket.to(receiverId).emit("user_typing",{
                userId,
                conversationId,
                isTyping:false
        })

        })

    //Add or update reaction to a message and notify the receiver
        socket.on("add_reaction",async({messageId,reaction,senderId,receiverId})=>{
            try {
                const message = await Message.findById(messageId);
                if(!message) return;

                const existingReactionIndex = message.reactions.findIndex(
                    r=>r.user.toString() === receiverId
                );
                
                
                if(existingReactionIndex >= 0){
                
                const existing = message.reactions[existingReactionIndex];
                if(existing.reaction === reaction){
                    //remove reaction if same reaction is sent again
                    message.reactions.splice(existingReactionIndex,1);
                }else{
                    //update to new reaction
                    message.reactions[existingReactionIndex].reaction = reaction;
                }
                }else{
                    message.reactions.push({user:senderId,reaction});
                }

                await message.save();

                const populatedMessage = await Message.findOne(message?._id)
                .populate("sender" ,"username profilePicture")
                .populate("receiver","username profilePicture")
                .populate("reactions.user","username profilePicture")

                const reactionUpdated = {
                    messageId,
                    reactions:populatedMessage.reactions
                }

                const senderSocketId = onlineUsers.get(populatedMessage.sender._id.toString());
                const receiverSocketId = onlineUsers.get(populatedMessage.receiver._id.toString());

                if(senderSocketId){
                    io.to(senderSocketId).emit("reaction_updated",reactionUpdated);
                }
                if(receiverSocketId){
                    io.to(receiverSocketId).emit("reaction_updated",reactionUpdated);
                }

            }catch (error) {
                console.log('Error in adding reaction',error);
            }

        })



    //handle user disconnection and mark them as offline
        const handleDisconnection = async () => {
            if(!senderId)  return ;

            try{
                onlineUsers.delete(senderId);

                //clear all typing timeouts
                if(typingUsers.has(senderId)){
                    const userTyping = typingUsers.get(senderId);
                    Object.keys(userTyping).forEach(key=>{
                        if(key.endsWith("_timeout")){
                            clearTimeout(userTyping[key]);
                        }
                    });

                    typingUsers.delete(senderId);
                }

                await User.findByIdAndUpdate(senderId,{
                    isOnline:false,
                    lastSeen:new Date()
                })

                io.emit("user_status",{
                    userId:senderId,
                    isOnline:false,
                    lastSeen:new Date()
                })

                socket.leave(senderId); //leave the user's room
                console.log('A user disconnected: ' + senderId);

            }catch(error){
                console.log('Error in user disconnection',error);   
        }

        }

        socket.on('disconnect',handleDisconnection);
    })

    io.socketUsermap = onlineUsers; //expose online users map for other modules if needed
    return io;

}


module.exports = initializeSocket;