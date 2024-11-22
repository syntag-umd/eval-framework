// promptBuilder.ts
/**
 * Recursively formats a value based on its type.
 * @param value The value to format.
 * @returns A string representation of the value.
 */
function formatValue(value: any): string {
  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  } else if (typeof value === 'object' && value !== null) {
    // For objects, format each key-value pair
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${formatValue(val)}`)
      .join("; ");
  } else {
    return String(value);
  }
}

/**
 * Builds a prompt by replacing template variables with their corresponding values from the config.
 * @param config The configuration object containing variable values.
 * @param systemPrompt The prompt template containing placeholders.
 * @returns The formatted prompt with all placeholders replaced.
 */
export function buildSystemPrompt(config: Record<string, any>, systemPrompt: string): string {
  let formattedPrompt = systemPrompt;

  // Regex to match all {{variable}} patterns
  const variableRegex = /\{\{([^}]+)\}\}/g;
  let match: RegExpExecArray | null;

  // Use a Set to collect unique variables
  const variables = new Set<string>();

  while ((match = variableRegex.exec(systemPrompt)) !== null) {
    variables.add(match[1].trim());
  }

  variables.forEach(variable => {
    const value = config[variable];
    if (value !== undefined) {
      const formattedValue = formatValue(value);
      // Create a global regex to replace all instances of the variable with optional whitespace
      const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g');
      formattedPrompt = formattedPrompt.replace(regex, formattedValue);
    }
  });

  return formattedPrompt.trim();
}

/**
 * Validates the prompt template to ensure all variables are present in the config.
 * @param template The prompt template containing placeholders.
 * @param config The configuration object to validate against.
 * @returns An object indicating validity and any errors found.
 */
export function validatePromptTemplate(template: string, config: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const variableRegex = /\{\{(\w+)\}\}/g;
  let match: RegExpExecArray | null;

  while ((match = variableRegex.exec(template)) !== null) {
    const variable = match[1];
    if (!(variable in config)) {
      errors.push(`Missing variable in config: ${variable}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
