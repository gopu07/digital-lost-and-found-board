# Backend API Documentation

## Running the Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server health status

### Items

#### Get All Items
- **GET** `/api/items`
- Query Parameters:
  - `status`: Filter by status (active, claimed, pending)
  - `type`: Filter by type (lost, found)
  - `category`: Filter by category
  - `location`: Filter by location

#### Add Item
- **POST** `/api/items`
- Body: JSON object with item details
- Returns: Item object with similar items and match status

#### Update Item
- **PUT** `/api/items/:id`
- Body: JSON object with fields to update
- Returns: Updated item object

#### Delete Item
- **DELETE** `/api/items/:id`
- Returns: Success message

### Search

#### Search Items
- **GET** `/api/search`
- Query Parameters:
  - `q`: Search query
  - `category`: Filter by category
  - `location`: Filter by location
  - `type`: Filter by type
  - `status`: Filter by status
  - `dateFrom`: Filter by date from
  - `dateTo`: Filter by date to

#### Get Search Suggestions
- **GET** `/api/search/suggestions?q=query`
- Returns: Array of suggestion strings

### Dashboard
- **GET** `/api/dashboard`
- Returns: Dashboard statistics and trends

### Similar Items
- **GET** `/api/items/:id/similar`
- Returns: Array of similar items

### Badges
- **GET** `/api/badges/:email`
- Returns: User badge data

### QR Code
- **GET** `/api/items/:id/qr`
- Returns: QR code data for item

## Data Storage

Data is stored in JSON files:
- `data/items.json`: All items
- `data/badges.json`: User badges and achievements

## Image Processing

Images are processed using MD5 hashing for similarity detection. Images are stored as base64 data URLs in the JSON file.

## Validation

All input is validated:
- Required fields must be present
- Contact info must be valid email or phone
- Dates must be in YYYY-MM-DD format
- Image size limited to 5MB

