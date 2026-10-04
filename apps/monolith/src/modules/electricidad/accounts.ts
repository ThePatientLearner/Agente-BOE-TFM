export interface Account { id: string; username: string; role: 'admin' | 'student'; status: 'pending' | 'active' | 'blocked'; studyAccess: boolean }
export class AccountError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export interface Accounts {
  register(username: unknown, password: unknown, code: unknown): Promise<void>;
  registerPublic(username: unknown, password: unknown, code: unknown): Promise<void>;
  login(username: unknown, password: unknown): Promise<{ token: string; user: Account }>;
  me(token: string): Promise<Account>;
  logout(token: string): Promise<void>;
  changePassword(token: string, current: unknown, password: unknown): Promise<void>;
  users(token: string): Promise<Account[]>;
  setStatus(token: string, id: unknown, status: unknown): Promise<void>;
}
