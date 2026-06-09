# Japan Visa Issuance Global Map 🇯🇵🌍

An interactive, open-source choropleth map built with React that visualizes the distribution of Japanese visas issued worldwide. This project highlights countries based on the volume of visas granted, providing a clear geographic overview of migration and travel data.

**Live Demo:** [Insert GitHub Pages URL here]

## 🛠️ Tech Stack

This project is built as a lightweight, static web application to ensure high performance and easy hosting on GitHub Pages:

- **[React](https://reactjs.org/)**: UI framework.
- **[React Simple Maps](https://www.react-simple-maps.io/)**: An SVG-based mapping library built on top of `d3-geo` and TopoJSON. It was chosen because it does not require an API key, avoids complex WebGL/tile-server overhead, and is perfect for country-level highlighting.
- **[D3.js (d3-scale / d3-fetch)](https://d3js.org/)**: Used for fetching the CSV data and generating the color scales for the choropleth map.
- **[React Tooltip](https://react-tooltip.com/)**: Provides hover interactions to display exact visa counts per country.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/anzaldoivan/japan-visa-map.git
   cd japan-visa-map
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## 📊 Data Processing

The map relies on standard TopoJSON for geographical boundaries. The visa data is mapped to these boundaries using ISO 3166-1 alpha-3 country codes.

When the component mounts, the app parses a static CSV file containing the visa counts, calculates a sequential color scale using `d3-scale`, and applies the appropriate color fill to each `<Geographies>` component based on the data threshold.

## ⚖️ Data Source & Disclaimer

**Source:** [Portal Site of Official Statistics of Japan (e-Stat)](https://www.e-stat.go.jp/)

The visa issuance statistics used in this visualization are sourced from the e-Stat database (Dataset ID: `0004019020`).

- **Modification Notice:** The original dataset has been edited, filtered, and formatted into a structured CSV by the repository owner (Ivan Anzaldo) to integrate with the mapping application.
- **Disclaimer:** This repository and the accompanying web application are created for research and portfolio purposes. It is an independent project and is **not** affiliated with, endorsed by, or representative of the Government of Japan, the Ministry of Justice, or the Immigration Services Agency.

## 📄 License

This project's source code is open-source and available under the [MIT License](LICENSE). The statistical data used is governed by the e-Stat [Terms of Use](https://www.e-stat.go.jp/en/terms-of-use) (Compatible with CC-BY).
