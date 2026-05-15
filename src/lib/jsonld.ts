export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HealthClub'],
    name: 'Sun City Paris',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '62 boulevard de Sébastopol',
      postalCode: '75003',
      addressLocality: 'Paris',
      addressCountry: 'FR',
    },
    telephone: '+33140092609',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.suncity-paris.fr',
    priceRange: '€€',
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'], opens: '12:00', closes: '02:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday', 'Saturday'], opens: '12:00', closes: '06:00' },
    ],
    sameAs: [
      'https://www.facebook.com/pages/Suncity-PARIS/189470147925236',
      'https://www.instagram.com/suncity_paris/',
      'https://twitter.com/SunCityParis',
    ],
  };
}
