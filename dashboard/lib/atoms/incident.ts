import { atom } from 'jotai';

export const selectedIncidentState = atom<any>(null);

export const isEditModeState = atom<boolean>(false);
