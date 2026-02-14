import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Patient {
    id: string;
    age: bigint;
    doctor: string;
    name: string;
}
export interface Session {
    id: string;
    eye: Eye;
    sessionType: SessionType;
    patientId: string;
    timestamp: Time;
}
export type Time = bigint;
export interface Capture {
    id: string;
    thumbnail: ExternalBlob;
    qualityScore?: bigint;
    timestamp: Time;
    sessionId: string;
    image: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum Eye {
    left = "left",
    right = "right"
}
export enum SessionType {
    emergency = "emergency",
    followUp = "followUp",
    routine = "routine"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCapture(id: string, sessionId: string, image: ExternalBlob, thumbnail: ExternalBlob): Promise<void>;
    addPatient(id: string, name: string, age: bigint, doctor: string): Promise<void>;
    addSession(id: string, patientId: string, sessionType: SessionType, eye: Eye): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllCaptures(): Promise<Array<Capture>>;
    getAllPatients(): Promise<Array<Patient>>;
    getAllSessions(): Promise<Array<Session>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCapture(id: string): Promise<Capture | null>;
    getPatient(id: string): Promise<Patient | null>;
    getSession(id: string): Promise<Session | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
