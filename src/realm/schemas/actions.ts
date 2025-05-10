// utils/OnboardingUtils.js

import {realm} from '..';

// Mark onboarding as visited
export const markOnboardingVisited = () => {
  realm.write(() => {
    realm.create('Onboarding', {id: 1, visited: true}, true); // Update if exists, otherwise create
  });
};

// Check if onboarding has been visited
export const isOnboardingVisited = () => {
  const onboarding = realm.objectForPrimaryKey('Onboarding', 1);
  return onboarding ? onboarding.visited : false;
};
