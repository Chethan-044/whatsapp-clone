import React, { use } from 'react'
import useLayoutStore from '../store/layoutStore'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import useThemeStore from '../store/themeStore'

const Layout = ({children, isThemeDialogOpen , toggleThemeDialog, isStatusPreviewOpen, isStatusPreviewContent}) => {
  const selectedContact = useLayoutStore((state)=>state.selectedContact)
  const setSelectedContact = useLayoutStore((state)=>state.setSelectedContact)
  const activeTab = useLayoutStore((state)=>state.activeTab)
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const {theme, setTheme} = useThemeStore()
  
  
  
  
  
  return (
    <div>Layout</div>
  )
}

export default Layout