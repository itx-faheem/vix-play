// database/RealmDB.js
import Realm from 'realm';
import {OnboardingSchema} from './schemas/OnboardingSchema';

export const realm = new Realm({
  schema: [OnboardingSchema],
  schemaVersion: 1, // Increment this if you change the schema
});
