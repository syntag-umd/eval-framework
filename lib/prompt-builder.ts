import { ShopConfig } from './types';

export function buildBarbershopPrompt(config: ShopConfig, systemPrompt: string): string {
  const {
    shop_name,
    shop_address,
    shop_schedule,
    barbers,
    services,
    hardcoded_datetime
  } = config;

  // Format the barbers list
  const barberListString = barbers.map(barber => barber.name).join(", ");

  // Format the services list
  const serviceListString = Object.entries(services)
    .map(([service, barberNames]) => `${service} (Offered by: ${barberNames.join(", ")})`)
    .join("; ");

  // Parse and format the datetime
  const hardcodedDate = new Date(hardcoded_datetime);
  const formattedDateTime = `${hardcodedDate.toLocaleString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: '2-digit', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  })}`;

  // Create a mapping of template variables to their values
  const templateVariables: { [key: string]: string } = {
    'shop_name': shop_name,
    'shop_address': shop_address,
    'shop_schedule': shop_schedule,
    'barbers': barberListString,
    'services': serviceListString,
    'hardcoded_datetime': formattedDateTime
  };

  // Replace all template variables in the system prompt
  let formattedPrompt = systemPrompt;
  Object.entries(templateVariables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    formattedPrompt = formattedPrompt.replace(regex, value);
  });

  return formattedPrompt.trim();
}

export function validatePromptTemplate(template: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validVariables = [
    'shop_name',
    'shop_address',
    'shop_schedule',
    'hardcoded_datetime',
    'barbers',
    'services'
  ];

  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  
  for (const match of matches) {
    const variable = match.slice(2, -2);
    if (!validVariables.includes(variable)) {
      errors.push(`Invalid variable: ${variable}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}