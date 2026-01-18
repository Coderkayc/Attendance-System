export type Role = "admin" | "lecturer" | "student";

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
};
