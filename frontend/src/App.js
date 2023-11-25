import React from 'react';
import {Routes, Route,BrowserRouter} from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register/Register';
import VerifyOTP from './pages/Verifyotp/Verifyotp';
function App() {
  return (
   <>
   <BrowserRouter>
   <Routes>
    <Route path="/" element={<Register/>} />
    <Route path="/verify-otp" element={<VerifyOTP/>} />       
    <Route path="/home" element={<Home/>} />
    </Routes>
    </BrowserRouter>
   </>
  );
}

export default App;
