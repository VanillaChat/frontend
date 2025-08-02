export const extractInviteCodes = (content: string): string[] => {
  if (!content) return [];
  
  const apiUrl = import.meta.env.VITE_INVITE_URL;
  const normalizedUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const inviteUrlPattern = new RegExp(`${escapeRegExp(normalizedUrl)}/([a-zA-Z0-9]+)`, 'g');
  
  const matches = [...content.matchAll(inviteUrlPattern)];
  return matches.map(match => match[1]);
};

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const processMessageContent = (content: string): { 
  processedContent: string; 
  inviteCodes: string[];
} => {
  const inviteCodes = extractInviteCodes(content);

  return { processedContent: content, inviteCodes };
};