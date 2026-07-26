export const normalizeWhatsAppNumber = (value) => {
  if (!value) return '';

  const digits = `${value}`.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('254')) {
    return `+${digits}`;
  }

  if (digits.startsWith('0')) {
    return `+254${digits.slice(1)}`;
  }

  if (digits.startsWith('7')) {
    return `+254${digits}`;
  }

  return `+${digits}`;
};

export const buildWhatsAppLink = (phone, message = 'Hello from Kibera Youth Centre.') => {
  const normalized = normalizeWhatsAppNumber(phone);
  if (!normalized) return null;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalized.replace('+', '')}?text=${encodedMessage}`;
};

export const openWhatsAppChat = (phone, message = 'Hello from Kibera Youth Centre.') => {
  const link = buildWhatsAppLink(phone, message);
  if (!link) return false;
  window.open(link, '_blank', 'noopener,noreferrer');
  return true;
};
