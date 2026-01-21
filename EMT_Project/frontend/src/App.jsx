import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router";
import Layout from "./ui/components/layout/Layout/Layout.jsx";
import HomePage from "./ui/pages/HomePage/HomePage.jsx";
import Register from "./ui/components/auth/Register/Register.jsx";
import Login from "./ui/components/auth/Login/Login.jsx";
import ProtectedRoute from "./ui/components/routing/ProtectedRoute/ProtectedRoute.jsx";
import ForgotPassword from "./ui/components/auth/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "./ui/components/auth/ResetPassword/ResetPassword.jsx";
import SearchPage from "./ui/pages/SearchPage/SearchPage.jsx";
import Profile from "./ui/pages/user/Profile/Profile.jsx";
import EditBiography from "./ui/pages/user/EditBiography/EditBiography.jsx";
import Repository from "./ui/pages/user/Repository/Repository.jsx";
import SearchResults from "./ui/pages/user/SearchResults/SearchResults.jsx";
import UserBlank from "./ui/pages/user/UserBlank/UserBlank.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout/>}>
                    <Route path="/" element={<HomePage/>}/>
                    {/*<Route path="/search" element={<SearchPage/>}/>*/}
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/reset-password" element={<ResetPassword/>}/>
                    <Route path="/search" element={<SearchResults />} />

                    <Route path="/repositories/:username/:id" element={<Repository />} />

                    {/*<Route path="/profile" element={<Layout/>}>*/}
                    {/*<Route index element={<HomePage/>}/>*/}
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/user" element={<UserBlank />} />
                        <Route path="/user/:username" element={<Profile/>}/>
                        <Route path="/biography/edit" element={<EditBiography/>}/>
                        {/*<Route path="products" element={<ProductsPage/>}/>*/}
                        {/*<Route path="products/:id" element={<ProductDetails/>}/>*/}
                        {/*<Route path="shopping-cart" element={<ShoppingCart/>}/>*/}
                    </Route>
                {/*</Route>*/}
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default App;
