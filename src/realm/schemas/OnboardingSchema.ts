// schemas/OnboardingSchema.js
export const OnboardingSchema = {
  name: 'Onboarding',
  primaryKey: 'id',
  properties: {
    id: 'int', // A unique identifier (we'll use 1 as the only ID)
    visited: 'bool', // Boolean to track if onboarding is completed
  },
};
