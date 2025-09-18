import React from 'react';
import './App.css';
import {Nav} from "./components/Nav";
import { Outlet } from "react-router-dom";
import {Toaster} from "react-hot-toast";

function App() {
    return (
        <div className="App h-auto dark:bg-[#2b2b2b]">
            <Nav/>
            <Outlet/>
            <Toaster position={'center'} />
        </div>)
}

export default App;
