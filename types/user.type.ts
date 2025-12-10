export interface User {
  userId: number
  fullname: string
  username: string
  password: string
  phone: string
  avatarUrl: string
  email: string
  role: "User" | "Partner" | "Admin" | "Manager" | "ManagerStaff" | "Cashier"
}
