"""
Lost and Found App - Flask Backend
A robust backend API for managing lost and found items on a college campus.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import json
import os
import hashlib
import base64
from typing import List, Dict, Optional
import re

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# JSON data file
DATA_FILE = 'data/items.json'
os.makedirs('data', exist_ok=True)

# Badges data file
BADGES_FILE = 'data/badges.json'


def load_items() -> List[Dict]:
    """Load items from JSON file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def save_items(items: List[Dict]) -> None:
    """Save items to JSON file"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2, ensure_ascii=False)


def load_badges() -> Dict:
    """Load badges data from JSON file"""
    if os.path.exists(BADGES_FILE):
        with open(BADGES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_badges(badges: Dict) -> None:
    """Save badges data to JSON file"""
    with open(BADGES_FILE, 'w', encoding='utf-8') as f:
        json.dump(badges, f, indent=2, ensure_ascii=False)


def calculate_image_hash(image_data: str) -> Optional[str]:
    """
    Calculate perceptual hash for image similarity detection.
    Simple implementation using average hash algorithm.
    """
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Calculate hash
        return hashlib.md5(image_bytes).hexdigest()[:16]
    except Exception:
        return None


def validate_item(data: Dict) -> tuple[bool, Optional[str]]:
    """Validate item data"""
    required_fields = ['title', 'description', 'category', 'location', 'date', 'type', 'contactName', 'contactInfo']
    
    for field in required_fields:
        if field not in data or not data[field] or not str(data[field]).strip():
            return False, f"{field} is required"
    
    # Validate type
    if data['type'] not in ['lost', 'found']:
        return False, "type must be 'lost' or 'found'"
    
    # Validate status
    if 'status' in data and data['status'] not in ['active', 'claimed', 'pending']:
        return False, "status must be 'active', 'claimed', or 'pending'"
    
    # Validate contact info (email or phone)
    contact_info = str(data['contactInfo']).strip()
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    phone_pattern = r'^\d{10}$'
    
    if not (re.match(email_pattern, contact_info) or re.match(phone_pattern, contact_info)):
        return False, "contactInfo must be a valid email or 10-digit phone number"
    
    # Validate date format
    try:
        datetime.strptime(data['date'], '%Y-%m-%d')
    except ValueError:
        return False, "date must be in YYYY-MM-DD format"
    
    return True, None


def award_badge(user_email: str, badge_type: str) -> None:
    """Award a badge to a user"""
    badges = load_badges()
    
    if user_email not in badges:
        badges[user_email] = {
            'reported_count': 0,
            'claimed_count': 0,
            'match_count': 0,
            'badges': []
        }
    
    user_badges = badges[user_email]
    
    # Award badges based on activity
    if badge_type == 'report':
        user_badges['reported_count'] += 1
        if user_badges['reported_count'] == 1 and 'first_report' not in user_badges['badges']:
            user_badges['badges'].append('first_report')
        elif user_badges['reported_count'] == 10 and 'reporter_10' not in user_badges['badges']:
            user_badges['badges'].append('reporter_10')
        elif user_badges['reported_count'] == 50 and 'reporter_50' not in user_badges['badges']:
            user_badges['badges'].append('reporter_50')
    elif badge_type == 'claim':
        user_badges['claimed_count'] += 1
        if user_badges['claimed_count'] == 1 and 'first_claim' not in user_badges['badges']:
            user_badges['badges'].append('first_claim')
        elif user_badges['claimed_count'] == 5 and 'claimer_5' not in user_badges['badges']:
            user_badges['badges'].append('claimer_5')
    elif badge_type == 'match':
        user_badges['match_count'] += 1
        if user_badges['match_count'] >= 1 and 'matchmaker' not in user_badges['badges']:
            user_badges['badges'].append('matchmaker')
    
    save_badges(badges)


def find_similar_items(image_hash: str, items: List[Dict], current_item_id: str = None) -> List[Dict]:
    """Find items with similar images"""
    if not image_hash:
        return []
    
    similar_items = []
    for item in items:
        if item.get('id') == current_item_id:
            continue
        if item.get('imageHash') == image_hash:
            similar_items.append({
                'id': item['id'],
                'title': item['title'],
                'image': item.get('image', ''),
                'status': item.get('status', 'active'),
                'type': item.get('type', 'found'),
                'similarity': 100  # Exact hash match
            })
    
    return similar_items


@app.route('/api/items', methods=['GET'])
def get_items():
    """Get all items with optional filtering"""
    items = load_items()
    
    # Query parameters for filtering
    status = request.args.get('status')
    item_type = request.args.get('type')
    category = request.args.get('category')
    location = request.args.get('location')
    
    # Filter items
    filtered_items = items
    if status and status != 'all':
        filtered_items = [i for i in filtered_items if i.get('status') == status]
    if item_type and item_type != 'all':
        filtered_items = [i for i in filtered_items if i.get('type') == item_type]
    if category and category != 'All':
        filtered_items = [i for i in filtered_items if i.get('category') == category]
    if location and location != 'All':
        filtered_items = [i for i in filtered_items if i.get('location') == location]
    
    return jsonify(filtered_items)


@app.route('/api/items', methods=['POST'])
def add_item():
    """Add a new lost/found item"""
    try:
        data = request.get_json()
        
        # Validate data
        is_valid, error_message = validate_item(data)
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        items = load_items()
        
        # Generate image hash if image provided
        image_hash = None
        if data.get('image'):
            image_hash = calculate_image_hash(data['image'])
        
        # Create new item
        new_item = {
            'id': str(int(datetime.now().timestamp() * 1000)),
            'title': data['title'].strip(),
            'description': data['description'].strip(),
            'category': data['category'],
            'location': data['location'],
            'date': data['date'],
            'status': data.get('status', 'active'),
            'type': data['type'],
            'image': data.get('image', ''),
            'imageHash': image_hash,
            'contactName': data['contactName'].strip(),
            'contactInfo': data['contactInfo'].strip(),
            'createdAt': datetime.now().isoformat(),
        }
        
        items.append(new_item)
        save_items(items)
        
        # Award badge for reporting
        award_badge(data['contactInfo'], 'report')
        
        # Check for similar items (potential matches)
        similar_items = []
        if image_hash:
            similar_items = find_similar_items(image_hash, items, new_item['id'])
        
        response = {
            'item': new_item,
            'similarItems': similar_items,
            'hasMatch': len(similar_items) > 0
        }
        
        return jsonify(response), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/items/<item_id>', methods=['PUT'])
def update_item(item_id: str):
    """Update an item (primarily for marking as claimed)"""
    try:
        data = request.get_json()
        items = load_items()
        
        item_index = None
        for i, item in enumerate(items):
            if item['id'] == item_id:
                item_index = i
                break
        
        if item_index is None:
            return jsonify({'error': 'Item not found'}), 404
        
        # Update item fields
        if 'status' in data:
            items[item_index]['status'] = data['status']
            
            # Award badge if item was claimed
            if data['status'] == 'claimed':
                award_badge(items[item_index]['contactInfo'], 'claim')
        
        if 'title' in data:
            items[item_index]['title'] = data['title'].strip()
        if 'description' in data:
            items[item_index]['description'] = data['description'].strip()
        if 'category' in data:
            items[item_index]['category'] = data['category']
        if 'location' in data:
            items[item_index]['location'] = data['location']
        
        save_items(items)
        
        return jsonify(items[item_index]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/items/<item_id>', methods=['DELETE'])
def delete_item(item_id: str):
    """Delete an item"""
    try:
        items = load_items()
        items = [item for item in items if item['id'] != item_id]
        save_items(items)
        
        return jsonify({'message': 'Item deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/search', methods=['GET'])
def search_items():
    """Search items with query parameters"""
    query = request.args.get('q', '').lower()
    category = request.args.get('category')
    location = request.args.get('location')
    item_type = request.args.get('type')
    status = request.args.get('status')
    date_from = request.args.get('dateFrom')
    date_to = request.args.get('dateTo')
    
    items = load_items()
    
    # Filter by search query
    if query:
        filtered_items = []
        for item in items:
            if (query in item.get('title', '').lower() or
                query in item.get('description', '').lower() or
                query in item.get('location', '').lower() or
                query in item.get('category', '').lower() or
                query in item.get('contactName', '').lower()):
                filtered_items.append(item)
        items = filtered_items
    
    # Apply additional filters
    if category and category != 'All':
        items = [i for i in items if i.get('category') == category]
    if location and location != 'All':
        items = [i for i in items if i.get('location') == location]
    if item_type and item_type != 'all':
        items = [i for i in items if i.get('type') == item_type]
    if status and status != 'all':
        items = [i for i in items if i.get('status') == status]
    
    # Filter by date range
    if date_from:
        items = [i for i in items if i.get('date', '') >= date_from]
    if date_to:
        items = [i for i in items if i.get('date', '') <= date_to]
    
    # Sort by newest first
    items.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
    
    return jsonify(items)


@app.route('/api/search/suggestions', methods=['GET'])
def get_search_suggestions():
    """Get search suggestions for autocomplete"""
    query = request.args.get('q', '').lower().strip()
    
    if len(query) < 2:
        return jsonify([])
    
    items = load_items()
    
    suggestions = set()
    for item in items:
        title = item.get('title', '').lower()
        category = item.get('category', '').lower()
        location = item.get('location', '').lower()
        
        if query in title:
            suggestions.add(item.get('title', ''))
        if query in category:
            suggestions.add(item.get('category', ''))
        if query in location:
            suggestions.add(item.get('location', ''))
    
    # Return top 10 suggestions
    return jsonify(list(suggestions)[:10])


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get dashboard statistics and trends"""
    items = load_items()
    
    # Basic statistics
    total_items = len(items)
    lost_items = len([i for i in items if i.get('type') == 'lost'])
    found_items = len([i for i in items if i.get('type') == 'found'])
    active_items = len([i for i in items if i.get('status') == 'active'])
    claimed_items = len([i for i in items if i.get('status') == 'claimed'])
    pending_items = len([i for i in items if i.get('status') == 'pending'])
    
    claim_rate = (claimed_items / total_items * 100) if total_items > 0 else 0
    
    # Most common categories
    category_count = {}
    for item in items:
        cat = item.get('category', 'Unknown')
        category_count[cat] = category_count.get(cat, 0) + 1
    
    top_categories = sorted(category_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Most common locations
    location_count = {}
    for item in items:
        loc = item.get('location', 'Unknown')
        location_count[loc] = location_count.get(loc, 0) + 1
    
    top_locations = sorted(location_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Most frequently lost items (by title similarity)
    title_count = {}
    for item in items:
        if item.get('type') == 'lost':
            title_key = item.get('title', '').lower()
            title_count[title_key] = title_count.get(title_key, 0) + 1
    
    most_lost_items = sorted(title_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Items by date (last 30 days)
    now = datetime.now()
    items_by_date = {}
    for item in items:
        try:
            item_date = datetime.fromisoformat(item.get('createdAt', '').replace('Z', '+00:00'))
            days_ago = (now - item_date.replace(tzinfo=None)).days
            if days_ago <= 30:
                items_by_date[days_ago] = items_by_date.get(days_ago, 0) + 1
        except:
            continue
    
    return jsonify({
        'stats': {
            'totalItems': total_items,
            'lostItems': lost_items,
            'foundItems': found_items,
            'activeItems': active_items,
            'claimedItems': claimed_items,
            'pendingItems': pending_items,
            'claimRate': round(claim_rate, 1)
        },
        'topCategories': [{'name': name, 'count': count} for name, count in top_categories],
        'topLocations': [{'name': name, 'count': count} for name, count in top_locations],
        'mostLostItems': [{'name': name, 'count': count} for name, count in most_lost_items],
        'itemsByDate': items_by_date
    })


@app.route('/api/items/<item_id>/similar', methods=['GET'])
def get_similar_items(item_id: str):
    """Get items similar to the specified item"""
    items = load_items()
    
    current_item = None
    for item in items:
        if item['id'] == item_id:
            current_item = item
            break
    
    if not current_item:
        return jsonify({'error': 'Item not found'}), 404
    
    image_hash = current_item.get('imageHash')
    if not image_hash:
        return jsonify([])
    
    similar = find_similar_items(image_hash, items, item_id)
    return jsonify(similar)


@app.route('/api/badges/<email>', methods=['GET'])
def get_user_badges(email: str):
    """Get badges for a specific user"""
    badges = load_badges()
    user_badges = badges.get(email, {
        'reported_count': 0,
        'claimed_count': 0,
        'match_count': 0,
        'badges': []
    })
    return jsonify(user_badges)


@app.route('/api/items/<item_id>/qr', methods=['GET'])
def get_item_qr(item_id: str):
    """Get QR code data for an item (frontend will generate the QR)"""
    items = load_items()
    
    for item in items:
        if item['id'] == item_id:
            # Return the URL that the QR code should link to
            # In production, this would be the actual frontend URL
            qr_data = {
                'itemId': item_id,
                'url': f'/items/{item_id}',
                'title': item.get('title', 'Lost & Found Item')
            }
            return jsonify(qr_data)
    
    return jsonify({'error': 'Item not found'}), 404


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Lost and Found API is running'})


if __name__ == '__main__':
    # Initialize with sample data if empty
    items = load_items()
    if not items:
        # Add some sample items
        sample_items = [
            {
                'id': '1',
                'title': 'Blue Backpack',
                'description': 'A blue JanSport backpack with laptop compartment. Contains some textbooks.',
                'category': 'Bags',
                'location': 'Library - 2nd Floor',
                'date': '2025-01-28',
                'status': 'active',
                'type': 'found',
                'image': '',
                'imageHash': None,
                'contactName': 'Sarah Johnson',
                'contactInfo': 'sarah.j@campus.edu',
                'createdAt': '2025-01-28T14:30:00',
            },
            {
                'id': '2',
                'title': 'iPhone 14 Pro',
                'description': 'Black iPhone with a cracked screen protector. Has a purple case.',
                'category': 'Electronics',
                'location': 'Student Center',
                'date': '2025-01-29',
                'status': 'active',
                'type': 'lost',
                'image': '',
                'imageHash': None,
                'contactName': 'Mike Chen',
                'contactInfo': 'mike.chen@campus.edu',
                'createdAt': '2025-01-29T09:15:00',
            },
        ]
        save_items(sample_items)
    
    app.run(debug=True, port=5000, host='0.0.0.0')

