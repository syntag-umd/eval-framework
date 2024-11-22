import { Tool } from "./settings";

export const TOOLS: Tool[] = [
    {
      type: 'function',
      function: {
        name: 'transfer_call_to_manager',
        description: 'Call this function to transfer the phone to the manager.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false,
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'fetch_service_price',
        description: 'Call this function when a customer asks for the price of a service.',
        parameters: {
          type: 'object',
          properties: {
            service: {
              description: 'The name of the service. Required.',
              type: 'string',
            },
            barber: {
              description: 'The name of the barber. Required.',
              type: 'string',
            },
          },
          required: ['service', 'barber'],
          additionalProperties: false,
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'fetch_availability_on_day_after_time',
        description: 'Call this function when a customer asks for the availability after a specific time.',
        parameters: {
          type: 'object',
          properties: {
            time: {
              description: 'HH:MM format.',
              type: 'string',
            },
            days_after_today: {
              description: 'Positive Integer.',
              type: 'integer',
            },
            service: {
              description: 'The name of the service.',
              type: 'string',
            },
            barber: {
              description: 'The name of the barber.',
              type: 'string',
            },
          },
          required: ['time', 'days_after_today', 'service'],
          additionalProperties: false,
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'check_walkin_availability',
        description: 'Call this function when a customer asks for walk-in availability.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false,
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'book_appointment',
        description: 'This function allows booking an appointment with a specified barber and service at a given time.',
        parameters: {
          type: 'object',
          properties: {
            barber: {
              description: 'The name of the barber.',
              type: 'string',
            },
            service: {
              description: 'The name of the service.',
              type: 'string',
            },
            day: {
              description: "Specify a day of the week (i.e., 'Monday', 'Tuesday', etc.).",
              type: 'string',
            },
            time: {
              description: 'HH:MM format',
              type: 'string',
            },
            firstName: {
              description: 'The first name of the client booking the appointment.',
              type: 'string',
            },
            lastName: {
              description: 'The last name of the client booking the appointment.',
              type: 'string',
            },
            canTextNumber: {
              description:
                'Whether or not the user consents to receiving a text confirmation of their appointment.',
              type: 'boolean',
            },
          },
          required: [
            'barber',
            'service',
            'day',
            'time',
            'firstName',
            'lastName',
            'canTextNumber',
          ],
          additionalProperties: false,
        },
      },
    },
  ];