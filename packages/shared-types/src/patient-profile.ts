export interface PatientProfile {
  id: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  age: number | null;
  nationalId: string | null;
  photoUrl: string | null;
  createdAt: string;
}
