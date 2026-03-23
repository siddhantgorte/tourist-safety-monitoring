import { atom } from 'jotai';

export const tokenAtom = atom<string | null>(null);
export const userAtom = atom<any | null>(null);

export const signupFormAtom = atom({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    nationality: ''
});
