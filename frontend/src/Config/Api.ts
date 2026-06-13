import axios from 'axios';

export const API_URL = "http://localhost:8080";
export const DEPLOYED_URL = "https://zosh-bazaar-mern.onrender.com"
// change api

export const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});