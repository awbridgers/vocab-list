export type RootStackParamsList = {
  Home: undefined;
  Test: undefined;
  Create: undefined;
  LogIn: undefined;
  Album: {album: string};
  Quiz: {album?: Album}
  
};
export type TabParamList = {
  WordList: undefined;
  Albums: undefined;

}
export interface Word {
  word: string;
  definition: string;
  notes: string,
  antonyms: string[];
  synonyms: string[];
  partOfSpeech: string[];
  id: string;
  albums: string[];
}
export interface Album {
  name: string,
  id: string
}

export interface Definition {
  partOfSpeech: string;
  definition: {
    definition: string;
    synonyms: string[];
    antonyms: string[];
    example: string;
  };
  synonyms: string[];
  antonyms: string[];
}

export interface Data {
  word: string;
  phonetic: string;
  phonetics: {text: string; audio?: string}[];
  origin: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      synonyms: string[];
      antonyms: string[];
      example: string;
    }[];
    synonyms: string[];
    antonyms: string[];
  }[];

  liscense?: {
    name: string;
    url?: string;
  };
  sourceUrls?: string[];
}

export type textContentType =
  | 'none'
  | 'URL'
  | 'addressCity'
  | 'addressCityAndState'
  | 'addressState'
  | 'countryName'
  | 'creditCardNumber'
  | 'emailAddress'
  | 'familyName'
  | 'fullStreetAddress'
  | 'givenName'
  | 'jobTitle'
  | 'location'
  | 'middleName'
  | 'name'
  | 'namePrefix'
  | 'nameSuffix'
  | 'nickname'
  | 'organizationName'
  | 'postalCode'
  | 'streetAddressLine1'
  | 'streetAddressLine2'
  | 'sublocality'
  | 'telephoneNumber'
  | 'username'
  | 'password';

export type autoCompleteType =
  | 'birthdate-day'
  | 'birthdate-full'
  | 'birthdate-month'
  | 'birthdate-year'
  | 'cc-csc'
  | 'cc-exp'
  | 'cc-exp-day'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-number'
  | 'email'
  | 'gender'
  | 'name'
  | 'name-family'
  | 'name-given'
  | 'name-middle'
  | 'name-middle-initial'
  | 'name-prefix'
  | 'name-suffix'
  | 'password'
  | 'password-new'
  | 'postal-address'
  | 'postal-address-country'
  | 'postal-address-extended'
  | 'postal-address-extended-postal-code'
  | 'postal-address-locality'
  | 'postal-address-region'
  | 'postal-code'
  | 'street-address'
  | 'sms-otp'
  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-device'
  | 'username'
  | 'username-new'
  | 'off';
