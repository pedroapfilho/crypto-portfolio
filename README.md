# Crypto Portfolio

This is a crypto portfolio management application built with Next.js, React, and Zustand. It allows users to track their cryptocurrency holdings and view detailed information about each asset.

## Features

- Add new cryptocurrency holdings
- Edit the quantity of existing holdings
- Remove holdings
- View current prices and total value of holdings
- Detailed asset information with historical price chart

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/crypto-portfolio.git
   cd crypto-portfolio
   ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Create a .env.local file in the root of the project and add your CoinGecko API key:

    ```bash
    NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key_here
    ```

### Running the Application

```bash
pnpm dev
```

Open your browser and navigate to http://localhost:3000.