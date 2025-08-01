"use client";
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import avatarImg from "../../../../public/assets/images/avatar/avatar.png";
import UserIcon from '@/svg/header-svg/Profile/UserIcon';
import ChatIcon from '@/svg/header-svg/Profile/ChatIcon';
import EmailIcon from '@/svg/header-svg/Profile/EmailIcon';
import AddAccountIcon from '@/svg/header-svg/Profile/AddAccountIcon';
import LogOut from '@/svg/header-svg/Profile/LogOut';
import { useRouter } from 'next/router';
//types


type TUserProps={
    handleShowUserDrowdown:()=>void;
    isOpenUserDropdown:boolean;
}

import { useEffect, useState } from "react";


  
const HeaderUserProfile = ({handleShowUserDrowdown, isOpenUserDropdown}:TUserProps) => {

     const [username, setUsername] = useState("");

   useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

    return (
        <>
            <div className="nav-item relative">
                 {/* Clickable profile icon */}
                <Link id="userportfolio" href="#" onClick={handleShowUserDrowdown}>
                    <div className="user__portfolio">
                        <div className="user__portfolio-thumb">
                            <Image src={avatarImg} alt="img not found" />
                        </div>
                        <div className="user__content text-white">
                            <h5 className='text-white'>{username}</h5>
                            <span>online</span>
                        </div>
                    </div>
                </Link>
                {/* Conditional rendering of the dropdown */}
                {isOpenUserDropdown && (
                    <div className={`user__dropdown ${isOpenUserDropdown ? "user-enable" : " "}`}>
                    <ul>
                        <li>
                            <Link href="/hrm/employee-profile">
                            <UserIcon/>
                                Profile</Link>
                        </li>
                        <li>
                            <Link href="/apps/app-chat">
                           <ChatIcon/>
                                chat</Link>
                        </li>
                        <li>
                            <Link href="/apps/email-inbox">
                            <EmailIcon/>
                                inbox
                            </Link>
                        </li>
                        <li>
                            <Link href="/auth/signup-basic">
                            <AddAccountIcon/>
                                add acount
                            </Link>
                        </li>
                        <li>
                            <Link href="">
                        <LogOut/>
                                Log Out</Link>
                        </li>
                    </ul>
                </div>
                )}
            </div>
        </>
    );
};

export default HeaderUserProfile;