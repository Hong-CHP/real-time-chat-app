export function sanitizeUsername(uname: string): string {
  if (!uname) return '';
  return uname
    .normalize('NFC')
    .trim()
    .replace(/\p{Cc}/gu, '')
    .replace(/\s+/g, ' ');
}

export function sanitizeEmail(uemail: string): string {
  return uemail.normalize('NFC').trim();
}

export function sanitizePassword(upassword: string): string {
  return upassword.normalize('NFC');
}