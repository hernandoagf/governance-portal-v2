/* Spock URLs */
export const LOCAL_SPOCK_URL = 'http://localhost:3001/v1';
// NOTE: Switch this back if things are broken:
export const GOERLI_SPOCK_URL = 'https://3aea-24-8-30-196.ngrok.io/v1';
// export const GOERLI_SPOCK_URL = 'https://polling-db-goerli.makerdux.com/api/v1';
export const STAGING_MAINNET_SPOCK_URL = 'https://polling-db-staging.makerdux.com/api/v1';
export const MAINNET_SPOCK_URL = 'https://polling-db-prod.makerdux.com/api/v1';

export enum QueryFilterNames {
  Active = 'active',
  PollId = 'pollId',
  Range = 'range',
  MultiHash = 'multiHash'
}
