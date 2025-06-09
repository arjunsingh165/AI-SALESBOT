from flask import Flask, request, jsonify, render_template, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
import bcrypt
import jwt
import datetime
import os
from dotenv import load_dotenv
import re
import sqlite3
import json

load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///products.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'category': self.category,
            'stock': self.stock,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    messages = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = db.relationship('User', backref=db.backref('chat_histories', lazy=True))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def parse_price_range(text):
    """Extract price range from text."""
    price_pattern = r'\$?(\d+)(?:\s*-\s*\$?(\d+))?'
    match = re.search(price_pattern, text)
    if match:
        min_price = float(match.group(1))
        max_price = float(match.group(2)) if match.group(2) else float('inf')
        return min_price, max_price
    return None, None

def parse_category(text):
    """Extract category from text."""
    categories = ['Electronics', 'Books', 'Fashion', 'Home', 'Toys', 'Sports', 'Beauty']
    for category in categories:
        if category.lower() in text.lower():
            return category
    return None

def handle_product_query(message):
    try:
        # Convert message to lowercase for easier matching
        message = message.lower().strip()
        
        # Welcome message
        if message in ['hi', 'hello', 'hey', 'start']:
            return "Welcome to our E-commerce Chatbot! I can help you with:\n1. Searching products\n2. Adding new products\n3. Updating products\n4. Deleting products\n5. Viewing all products\n\nHow can I assist you today?"

        # Add product
        if message.startswith('add product:'):
            try:
                # Extract product details using regex
                pattern = r'add product:\s*([^,]+),\s*(\d+\.?\d*),\s*(\d+),\s*([^,]+)'
                match = re.match(pattern, message, re.IGNORECASE)
                if match:
                    name, price, stock, category = match.groups()
                    name = name.strip()
                    price = float(price)
                    stock = int(stock)
                    category = category.strip()

                    # Check if product already exists
                    existing_product = Product.query.filter_by(name=name).first()
                    if existing_product:
                        return f"Product '{name}' already exists. Would you like to update it instead?"

                    # Create new product
                    new_product = Product(
                        name=name,
                        price=price,
                        stock=stock,
                        category=category
                    )
                    db.session.add(new_product)
                    db.session.commit()
                    return f"Successfully added product: {name} (${price}, {stock} in stock, {category})"
                else:
                    return "Please use the format: Add product: [name], [price], [stock], [category]"
            except Exception as e:
                db.session.rollback()
                return f"Error adding product: {str(e)}"

        # Update product
        elif message.startswith('update product:'):
            try:
                pattern = r'update product:\s*([^,]+),\s*([^,]+),\s*([^,]+)'
                match = re.match(pattern, message, re.IGNORECASE)
                if match:
                    name, field, new_value = match.groups()
                    name = name.strip()
                    field = field.strip().lower()
                    new_value = new_value.strip()

                    product = Product.query.filter_by(name=name).first()
                    if not product:
                        return f"Product '{name}' not found."

                    if field == 'price':
                        product.price = float(new_value)
                    elif field == 'stock':
                        product.stock = int(new_value)
                    elif field == 'category':
                        product.category = new_value
                    else:
                        return f"Invalid field: {field}. Please use: price, stock, or category"

                    db.session.commit()
                    return f"Successfully updated {field} for {name} to {new_value}"
                else:
                    return "Please use the format: Update product: [name], [field], [new value]"
            except Exception as e:
                db.session.rollback()
                return f"Error updating product: {str(e)}"

        # Delete product
        elif message.startswith('delete product:'):
            try:
                name = message.replace('delete product:', '').strip()
                product = Product.query.filter_by(name=name).first()
                if product:
                    db.session.delete(product)
                    db.session.commit()
                    return f"Successfully deleted product: {name}"
                return f"Product '{name}' not found."
            except Exception as e:
                db.session.rollback()
                return f"Error deleting product: {str(e)}"

        # List all products
        elif message in ['show all products', 'list products', 'products']:
            products = Product.query.all()
            if not products:
                return "No products found in inventory."
            response = "Here are all products:\n\n"
            for product in products:
                response += f"- {product.name}: ${product.price}, {product.stock} in stock, {product.category}\n"
            return response

        # Search by name
        elif message.startswith('search'):
            search_term = message.replace('search', '').strip()
            products = Product.query.filter(Product.name.ilike(f'%{search_term}%')).all()
            if not products:
                return f"No products found matching '{search_term}'."
            response = f"Found {len(products)} products matching '{search_term}':\n\n"
            for product in products:
                response += f"- {product.name}: ${product.price}, {product.stock} in stock, {product.category}\n"
            return response

        # Filter by category
        elif message.startswith('category'):
            category = message.replace('category', '').strip()
            products = Product.query.filter(Product.category.ilike(f'%{category}%')).all()
            if not products:
                return f"No products found in category '{category}'."
            response = f"Products in category '{category}':\n\n"
            for product in products:
                response += f"- {product.name}: ${product.price}, {product.stock} in stock\n"
            return response

        # Default response
        return "I can help you with:\n1. Searching products\n2. Adding new products\n3. Updating products\n4. Deleting products\n5. Viewing all products\n\nPlease let me know what you'd like to do!"

    except Exception as e:
        return f"An error occurred: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT,
            stock INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        if not all([username, password, email]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Check if username or email already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            password=hashed_password.decode('utf-8')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'Registration successful'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            login_user(user)
            session['user_id'] = user.id
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        logout_user()
        session.pop('user_id', None)
        return jsonify({'message': 'Logged out successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    try:
        if current_user.is_authenticated:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': current_user.id,
                    'username': current_user.username,
                    'email': current_user.email
                }
            })
        return jsonify({'authenticated': False}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401

        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400

        response = handle_product_query(message)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify({'products': [product.to_dict() for product in products]})

@app.route('/api/products/search', methods=['GET'])
def search_products():
    name = request.args.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Product name is required'}), 400
    
    try:
        # Use case-insensitive search with partial matching
        products = Product.query.filter(Product.name.ilike(f'%{name}%')).all()
        return jsonify({'products': [product.to_dict() for product in products]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
def add_product():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'price', 'category', 'stock']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if product already exists
        existing_product = Product.query.filter_by(name=data['name']).first()
        if existing_product:
            return jsonify({'error': 'Product with this name already exists'}), 400
        
        # Create new product
        product = Product(
            name=data['name'],
            price=float(data['price']),
            category=data['category'],
            stock=int(data['stock'])
        )
        db.session.add(product)
        db.session.commit()
        
        return jsonify(product.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/category/<category>', methods=['GET'])
def get_products_by_category(category):
    try:
        products = Product.query.filter_by(category=category).all()
        return jsonify({'products': [product.to_dict() for product in products]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/reduce-stock/<name>', methods=['PUT'])
def reduce_stock(name):
    try:
        product = Product.query.filter_by(name=name).first()
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.json
        if not data or 'amount' not in data:
            return jsonify({'error': 'Amount is required'}), 400
        
        amount = int(data['amount'])
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        
        if product.stock < amount:
            return jsonify({'error': 'Not enough stock available'}), 400
        
        product.stock -= amount
        db.session.commit()
        
        return jsonify({
            'message': f'Stock reduced by {amount}',
            'stock': product.stock
        })
    except ValueError:
        return jsonify({'error': 'Invalid amount format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/update/<name>', methods=['PUT'])
def update_product(name):
    try:
        product = Product.query.filter_by(name=name).first()
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.json
        if not data:
            return jsonify({'error': 'No update data provided'}), 400
        
        # Update fields if provided
        if 'price' in data:
            try:
                product.price = float(data['price'])
            except ValueError:
                return jsonify({'error': 'Invalid price format'}), 400
        
        if 'category' in data:
            product.category = data['category']
        
        if 'stock' in data:
            try:
                new_stock = int(data['stock'])
                if new_stock < 0:
                    return jsonify({'error': 'Stock cannot be negative'}), 400
                product.stock = new_stock
            except ValueError:
                return jsonify({'error': 'Invalid stock format'}), 400
        
        db.session.commit()
        return jsonify(product.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/delete/<name>', methods=['DELETE'])
def delete_product(name):
    try:
        product = Product.query.filter_by(name=name).first()
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': f'Product "{name}" deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/history', methods=['GET', 'POST'])
@login_required
def chat_history():
    try:
        if request.method == 'GET':
            # Get the latest chat history for the user
            history = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.updated_at.desc()).first()
            if history:
                return jsonify({'history': history.messages})
            return jsonify({'history': []})

        elif request.method == 'POST':
            data = request.get_json()
            messages = data.get('messages', [])

            # Update or create chat history
            history = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.updated_at.desc()).first()
            if history:
                history.messages = messages
                history.updated_at = datetime.datetime.utcnow()
            else:
                history = ChatHistory(
                    user_id=current_user.id,
                    messages=messages
                )
                db.session.add(history)

            db.session.commit()
            return jsonify({'message': 'Chat history saved successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    init_db()
    app.run(debug=True) 