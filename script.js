'use strict';

const menuBtn = document.getElementById('menubtn');
const menu = document.getElementById('menu');

const profile = document.getElementById('profile');
const profilePage = document.getElementById('profilepage');
const profileCloseBtn = document.getElementById('profileclosebtn');

const contact = document.getElementById('contact');
const contactPage = document.getElementById('contactpage');
const contactCloseBtn = document.getElementById('contactclosebtn');

menuBtn.addEventListener('click', openMenu);

profile.addEventListener('click', openProfile);
profileCloseBtn.addEventListener('click', closeProfile);

contact.addEventListener('click', openContact);
contactCloseBtn.addEventListener('click', closeContact);

window.addEventListener('load',openingAnimation);

function openMenu(){
    menu.classList.toggle('openmenu');
}

function openProfile(){
    profilePage.classList.add('openprofile');
}

function closeProfile(){
    profilePage.classList.remove('openprofile');
}

function openContact(){
    contactPage.classList.add('opencontact');
}

function closeContact(){
    contactPage.classList.remove('opencontact');
}

function openingAnimation(){
    const opening = document.getElementById('opening');
    setTimeout(function(){
        opening.classList.add('end');
        setTimeout(function(){
            opening.classList.remove('active');
        },1100)
    },1600)
}
