# Chinese Memory Cards Application

A modern, minimalist web application that helps beginner-to-intermediate learners of Mandarin Chinese master sentences through user-created, image-anchored memory cards.

## Features

- **Create Personalized Memory Cards**: Upload images and add Chinese text (Hanzi, Pinyin, and translations)
- **Three Card Template Styles**:
  - Meme Style: Impact font with black outline
  - Subtitle Style: Semi-transparent bar at bottom with text
  - Sticky Note Style: Hand-drawn frame around text
- **Dual View Modes**:
  - List View: Shows text-focused entries in a list format
  - Gallery View: Displays a grid of image thumbnails
- **Organization Features**:
  - Flag cards for review
  - Filter by All/New/Flagged cards
  - Download individual cards as PNG
  - Export all cards as JSON backup
- **Zero-Backend Architecture**:
  - All data stored locally in browser
  - No account creation needed

## Technologies Used

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Storage**: Browser LocalStorage
- **Image Processing**: html2canvas for PNG export

## Getting Started

### Prerequisites

- Node.js 16.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chinese-memory-app.git
   cd chinese-memory-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Creating Cards**:
   - Click "Create Your First Card" on the landing page
   - Upload an image (meme, movie still, or personal photo)
   - Add your Chinese sentence with pinyin and translation
   - Choose a template style
   - Save the card

2. **Reviewing Cards**:
   - Visit the "My Cards" dashboard
   - Switch between List and Gallery views
   - Click on cards to view details
   - Flag important cards for review
   - Filter by new or flagged cards

3. **Exporting Cards**:
   - Download individual cards as PNG images
   - Export your entire collection as a JSON file for backup

## Project Goal

The goal of this application is to help Chinese learners create a collection of personalized, visually anchored memory aids. By attaching Chinese sentences to images that are meaningful to the learner, we leverage the power of visual memory and personal connection to enhance language retention.

The recommended usage pattern is to create approximately 24 cards over a 3-day period, focusing on sentences and vocabulary relevant to your current learning goals.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
