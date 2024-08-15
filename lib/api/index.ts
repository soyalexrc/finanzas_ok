import { create } from 'apisauce';

export const api = create({
    baseURL: 'https://finanzas-ok-backend.vercel.app/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});
