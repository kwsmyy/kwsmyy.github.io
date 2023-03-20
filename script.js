'use strict';

const menubtn = document.getElementById('menubtn');
const menu = document.getElementById('menu');

const profile = document.getElementById('profile');
const profilepage = document.getElementById('profilepage');
const profileclosebtn = document.getElementById('profileclosebtn');

const contact = document.getElementById('contact');
const contactpage = document.getElementById('contactpage');
const contactclosebtn = document.getElementById('contactclosebtn');

menubtn.addEventListener('click', openmenu);

profile.addEventListener('click', openprofile);
profileclosebtn.addEventListener('click', closeprofile);

contact.addEventListener('click', opencontact);
contactclosebtn.addEventListener('click', closecontact);

function openmenu(){
    menu.classList.toggle('openmenu');
}

function openprofile(){
    profilepage.classList.add('openprofile');
}

function closeprofile(){
    profilepage.classList.remove('openprofile');
}

function opencontact(){
    contactpage.classList.add('opencontact');
}

function closecontact(){
    contactpage.classList.remove('opencontact');
}