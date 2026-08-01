export const environment = {
  get apiBaseUrl(): string {
    if (typeof window !== 'undefined' && window.location.port === '4200') {
      return '';
    }
    return 'http://localhost:8080';
  }
};
