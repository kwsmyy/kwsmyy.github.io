'use strict';

const menuBtn = document.getElementById('menubtn');
const menu = document.getElementById('menu');

const profile = document.getElementById('profile');
const profilePage = document.getElementById('profilepage');
const profileCloseBtn = document.getElementById('profileclosebtn');

const contact = document.getElementById('contact');
const contactPage = document.getElementById('contactpage');
const contactCloseBtn = document.getElementById('contactclosebtn');

menuBtn.addEventListener('click', openmenu);

profile.addEventListener('click', openprofile);
profileCloseBtn.addEventListener('click', closeprofile);

contact.addEventListener('click', opencontact);
contactCloseBtn.addEventListener('click', closecontact);

function openmenu(){
    menu.classList.toggle('openmenu');
}

function openprofile(){
    profilePage.classList.add('openprofile');
}

function closeprofile(){
    profilePage.classList.remove('openprofile');
}

function opencontact(){
    contactPage.classList.add('opencontact');
}

function closecontact(){
    contactPage.classList.remove('opencontact');
}