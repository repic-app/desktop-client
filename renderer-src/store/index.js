import React, { useContext } from 'react'

const APPContext = React.createContext()

export default APPContext

export const Provider = APPContext.Provider
export const Consumer = APPContext.Consumer

export const getContextData = () => useContext(APPContext)