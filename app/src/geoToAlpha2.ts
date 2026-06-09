// ISO 3166-1 numeric (as used in world-atlas geo.id) → alpha-2
// Covers all countries present in the e-stat dataset.
const GEO_TO_ALPHA2: Record<string, string> = {
  // Asia
  "004": "AF", // Afghanistan
  "784": "AE", // UAE
  "887": "YE", // Yemen
  "376": "IL", // Israel
  "368": "IQ", // Iraq
  "364": "IR", // Iran
  "356": "IN", // India
  "360": "ID", // Indonesia
  "512": "OM", // Oman
  "634": "QA", // Qatar
  "410": "KR", // South Korea
  "408": "KP", // North Korea (朝鮮)
  "116": "KH", // Cambodia
  "196": "CY", // Cyprus
  "414": "KW", // Kuwait
  "682": "SA", // Saudi Arabia
  "760": "SY", // Syria
  "702": "SG", // Singapore
  "144": "LK", // Sri Lanka
  "764": "TH", // Thailand
  "158": "TW", // Taiwan
  "156": "CN", // China
  "792": "TR", // Turkey
  "524": "NP", // Nepal
  "048": "BH", // Bahrain
  "586": "PK", // Pakistan
  "275": "PS", // Palestine
  "050": "BD", // Bangladesh
  "626": "TL", // Timor-Leste
  "608": "PH", // Philippines
  "064": "BT", // Bhutan
  "096": "BN", // Brunei
  "704": "VN", // Vietnam
  "458": "MY", // Malaysia
  "104": "MM", // Myanmar
  "462": "MV", // Maldives
  "496": "MN", // Mongolia
  "400": "JO", // Jordan
  "418": "LA", // Laos
  "422": "LB", // Lebanon
  // Europe
  "352": "IS", // Iceland
  "372": "IE", // Ireland
  "031": "AZ", // Azerbaijan
  "008": "AL", // Albania
  "051": "AM", // Armenia
  "020": "AD", // Andorra
  "380": "IT", // Italy
  "804": "UA", // Ukraine
  "860": "UZ", // Uzbekistan
  "826": "GB", // United Kingdom
  "233": "EE", // Estonia
  "040": "AT", // Austria
  "528": "NL", // Netherlands
  "398": "KZ", // Kazakhstan
  "807": "MK", // North Macedonia
  "300": "GR", // Greece
  "417": "KG", // Kyrgyzstan
  "191": "HR", // Croatia
  "674": "SM", // San Marino
  "268": "GE", // Georgia
  "756": "CH", // Switzerland
  "752": "SE", // Sweden
  "724": "ES", // Spain
  "703": "SK", // Slovakia
  "705": "SI", // Slovenia
  "688": "RS", // Serbia
  "762": "TJ", // Tajikistan
  "203": "CZ", // Czech Republic
  "208": "DK", // Denmark
  "276": "DE", // Germany
  "795": "TM", // Turkmenistan
  "578": "NO", // Norway
  "348": "HU", // Hungary
  "246": "FI", // Finland
  "250": "FR", // France
  "100": "BG", // Bulgaria
  "112": "BY", // Belarus
  "056": "BE", // Belgium
  "616": "PL", // Poland
  "070": "BA", // Bosnia and Herzegovina
  "620": "PT", // Portugal
  "470": "MT", // Malta
  "492": "MC", // Monaco
  "498": "MD", // Moldova
  "499": "ME", // Montenegro
  "428": "LV", // Latvia
  "440": "LT", // Lithuania
  "438": "LI", // Liechtenstein
  "642": "RO", // Romania
  "442": "LU", // Luxembourg
  "643": "RU", // Russia
  // Africa
  "012": "DZ", // Algeria
  "024": "AO", // Angola
  "800": "UG", // Uganda
  "818": "EG", // Egypt
  "748": "SZ", // Eswatini
  "231": "ET", // Ethiopia
  "232": "ER", // Eritrea
  "288": "GH", // Ghana
  "132": "CV", // Cape Verde
  "266": "GA", // Gabon
  "120": "CM", // Cameroon
  "270": "GM", // Gambia
  "324": "GN", // Guinea
  "624": "GW", // Guinea-Bissau
  "404": "KE", // Kenya
  "384": "CI", // Côte d'Ivoire
  "174": "KM", // Comoros
  "178": "CG", // Republic of Congo
  "180": "CD", // DR Congo
  "678": "ST", // São Tomé and Príncipe
  "894": "ZM", // Zambia
  "694": "SL", // Sierra Leone
  "262": "DJ", // Djibouti
  "716": "ZW", // Zimbabwe
  "729": "SD", // Sudan
  "690": "SC", // Seychelles
  "226": "GQ", // Equatorial Guinea
  "686": "SN", // Senegal
  "706": "SO", // Somalia
  "834": "TZ", // Tanzania
  "148": "TD", // Chad
  "140": "CF", // Central African Republic
  "788": "TN", // Tunisia
  "768": "TG", // Togo
  "566": "NG", // Nigeria
  "516": "NA", // Namibia
  "562": "NE", // Niger
  "854": "BF", // Burkina Faso
  "108": "BI", // Burundi
  "204": "BJ", // Benin
  "072": "BW", // Botswana
  "450": "MG", // Madagascar
  "454": "MW", // Malawi
  "466": "ML", // Mali
  "710": "ZA", // South Africa
  "728": "SS", // South Sudan
  "480": "MU", // Mauritius
  "478": "MR", // Mauritania
  "508": "MZ", // Mozambique
  "504": "MA", // Morocco
  "434": "LY", // Libya
  "430": "LR", // Liberia
  "646": "RW", // Rwanda
  "426": "LS", // Lesotho
  // North America
  "028": "AG", // Antigua and Barbuda
  "222": "SV", // El Salvador
  "124": "CA", // Canada
  "192": "CU", // Cuba
  "320": "GT", // Guatemala
  "308": "GD", // Grenada
  "188": "CR", // Costa Rica
  "388": "JM", // Jamaica
  "659": "KN", // Saint Kitts and Nevis
  "670": "VC", // Saint Vincent
  "662": "LC", // Saint Lucia
  "212": "DM", // Dominica
  "214": "DO", // Dominican Republic
  "780": "TT", // Trinidad and Tobago
  "558": "NI", // Nicaragua
  "332": "HT", // Haiti
  "591": "PA", // Panama
  "044": "BS", // Bahamas
  "052": "BB", // Barbados
  "840": "US", // United States
  "084": "BZ", // Belize
  "340": "HN", // Honduras
  "484": "MX", // Mexico
  // South America
  "032": "AR", // Argentina
  "858": "UY", // Uruguay
  "218": "EC", // Ecuador
  "328": "GY", // Guyana
  "170": "CO", // Colombia
  "740": "SR", // Suriname
  "152": "CL", // Chile
  "600": "PY", // Paraguay
  "076": "BR", // Brazil
  "862": "VE", // Venezuela
  "604": "PE", // Peru
  "068": "BO", // Bolivia
  // Oceania
  "036": "AU", // Australia
  "296": "KI", // Kiribati
  "882": "WS", // Samoa
  "090": "SB", // Solomon Islands
  "798": "TV", // Tuvalu
  "776": "TO", // Tonga
  "520": "NR", // Nauru
  "554": "NZ", // New Zealand
  "548": "VU", // Vanuatu
  "598": "PG", // Papua New Guinea
  "585": "PW", // Palau
  "242": "FJ", // Fiji
  "584": "MH", // Marshall Islands
  "583": "FM", // Micronesia
}

export default GEO_TO_ALPHA2
