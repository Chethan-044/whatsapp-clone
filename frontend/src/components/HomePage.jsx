import React, { useEffect } from "react";
import Layout from "./Layout";
import { motion } from "framer-motion";
import chatList from "../pages/chatSection/ChatList";
import useLayoutStore from "../store/layoutStore";
import { getAllUsers } from "../Services/user.service";
import { useState } from "react";
import Chatwindow from "../pages/chatSection/Chatwindow";
import ChatList from "../pages/chatSection/ChatList";



const HomePage = () => {
  const setselectedContact = useLayoutStore(
    (state) => state.setSelectedContact,
  )

  const [allUsers , setAllUsers] = useState([]);

  const getUser = async()=>{
try {
      const result = await getAllUsers()
      if(result.status === 'success'){
        setAllUsers(result.data)
      }
    } catch (error) {
      console.log(error);
    } 

}

useEffect(()=>{
  getAllUsers();
},[])



  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ChatList contacts={allUsers} setSelectedContact={setselectedContact}  />
      </motion.div>
    </Layout>
  );
};

export default HomePage;
