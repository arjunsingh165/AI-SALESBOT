from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chatbot.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    messages = db.relationship('Message', backref='user', lazy=True)
    is_new_user = db.Column(db.Boolean, default=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'user' or 'assistant'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Create tables and delete existing data
with app.app_context():
    db.drop_all()  # This will delete all existing data
    db.create_all()

# Helper functions
def get_current_user():
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    return None

def get_welcome_message(username):
    return f"""🌟 Welcome {username}! I'm your AI Sales Assistant 🌟

I'm here to help you manage your products and sales. Here's what I can do:

📦 Product Management:
• Add new products
• Update existing products
• Delete products
• Search products
• List all products
• Show products by category

🎯 Example Commands:
• "add product: laptop, 999.99, 10, electronics"
• "search laptop"
• "show all products"
• "category electronics"

Type "help" to see all available commands! 😊"""

def add_product(message, user_id):
    try:
        # Format: "add product: name, price, stock, category"
        parts = message[12:].split(',')
        if len(parts) != 4:
            return "❌ Invalid format. Please use: add product: name, price, stock, category\nExample: add product: laptop, 999.99, 10, electronics"
        
        name = parts[0].strip()
        price = float(parts[1].strip())
        stock = int(parts[2].strip())
        category = parts[3].strip()
        
        product = Product(
            name=name,
            price=price,
            stock=stock,
            category=category,
            user_id=user_id
        )
        db.session.add(product)
        db.session.commit()
        return f"✅ Product '{name}' added successfully!"
    except Exception as e:
        return f"❌ Error adding product: {str(e)}\nPlease use the correct format: add product: name, price, stock, category"

def update_product(message, user_id):
    try:
        # Format: "update product: name, field, value"
        parts = message[15:].split(',')
        if len(parts) != 3:
            return "❌ Invalid format. Please use: update product: name, field, value\nExample: update product: laptop, price, 899.99"
        
        name = parts[0].strip()
        field = parts[1].strip().lower()
        value = parts[2].strip()
        
        product = Product.query.filter_by(name=name, user_id=user_id).first()
        if not product:
            return f"❌ Product '{name}' not found"
        
        if field == 'price':
            product.price = float(value)
        elif field == 'stock':
            product.stock = int(value)
        elif field == 'category':
            product.category = value
        else:
            return f"❌ Invalid field: {field}\nValid fields are: price, stock, category"
        
        db.session.commit()
        return f"✅ Product '{name}' updated successfully!"
    except Exception as e:
        return f"❌ Error updating product: {str(e)}\nPlease use the correct format: update product: name, field, value"

def delete_product(message, user_id):
    try:
        name = message[15:].strip()
        product = Product.query.filter_by(name=name, user_id=user_id).first()
        if not product:
            return f"❌ Product '{name}' not found"
        
        db.session.delete(product)
        db.session.commit()
        return f"✅ Product '{name}' deleted successfully!"
    except Exception as e:
        return f"❌ Error deleting product: {str(e)}\nPlease use the correct format: delete product: name"

def search_products(message, user_id):
    try:
        query = message[7:].strip()
        if not query:
            return "❌ Please provide a search query\nExample: search laptop"
            
        products = Product.query.filter(
            Product.name.ilike(f'%{query}%'),
            Product.user_id == user_id
        ).all()
        
        if not products:
            return f"❌ No products found matching '{query}'"
        
        result = "🔍 Search Results:\n\n"
        for product in products:
            result += f"📦 {product.name}\n"
            result += f"💰 Price: ${product.price:.2f}\n"
            result += f"📊 Stock: {product.stock}\n"
            result += f"🏷️ Category: {product.category}\n"
            result += "-------------------\n"
        return result
    except Exception as e:
        return f"❌ Error searching products: {str(e)}\nPlease use the correct format: search query"

def show_all_products(user_id):
    try:
        products = Product.query.filter_by(user_id=user_id).all()
        if not products:
            return "📦 No products found. Add some products to get started!"
        
        result = "📦 All Products:\n\n"
        for product in products:
            result += f"📦 {product.name}\n"
            result += f"💰 Price: ${product.price:.2f}\n"
            result += f"📊 Stock: {product.stock}\n"
            result += f"🏷️ Category: {product.category}\n"
            result += "-------------------\n"
        return result
    except Exception as e:
        return f"❌ Error listing products: {str(e)}"

def show_products_by_category(message, user_id):
    try:
        category = message[9:].strip()
        if not category:
            return "❌ Please provide a category\nExample: category electronics"
            
        products = Product.query.filter_by(category=category, user_id=user_id).all()
        
        if not products:
            return f"❌ No products found in category '{category}'"
        
        result = f"🏷️ Products in {category}:\n\n"
        for product in products:
            result += f"📦 {product.name}\n"
            result += f"💰 Price: ${product.price:.2f}\n"
            result += f"📊 Stock: {product.stock}\n"
            result += "-------------------\n"
        return result
    except Exception as e:
        return f"❌ Error listing category products: {str(e)}\nPlease use the correct format: category name"

def process_command(message, user_id):
    """Process user commands and return appropriate response"""
    message = message.lower().strip()
    
    # Handle welcome message
    if message == 'welcome':
        user = User.query.get(user_id)
        return get_welcome_message(user.username)
    
    # Handle help command
    if message == 'help':
        return """Here are the available commands:

1. Add a product:
   add product: [name], [price], [quantity], [category]
   Example: add product: laptop, 999.99, 10, electronics

2. Search products:
   search [keyword]
   Example: search laptop

3. Update a product:
   update product: [name], [field], [value]
   Example: update product: laptop, price, 899.99

4. Delete a product:
   delete product: [name]
   Example: delete product: laptop

5. Show all products:
   show all products

6. Show products by category:
   category [category_name]
   Example: category electronics"""

    # Handle add product command
    if message.startswith('add product:'):
        try:
            # Parse the command
            parts = message[len('add product:'):].strip().split(',')
            if len(parts) != 4:
                return "❌ Invalid format. Use: add product: [name], [price], [quantity], [category]"
            
            name = parts[0].strip()
            price = float(parts[1].strip())
            quantity = int(parts[2].strip())
            category = parts[3].strip()
            
            # Check if product already exists
            existing_product = Product.query.filter_by(name=name).first()
            if existing_product:
                return f"❌ Product '{name}' already exists"
            
            # Create new product
            new_product = Product(
                name=name,
                price=price,
                stock=quantity,
                category=category,
                user_id=user_id
            )
            db.session.add(new_product)
            db.session.commit()
            
            return f"✅ Product '{name}' added successfully!"
            
        except ValueError as e:
            return f"❌ Error: {str(e)}"
        except Exception as e:
            return f"❌ Error adding product: {str(e)}"
    
    # Handle search command
    if message.startswith('search '):
        keyword = message[len('search '):].strip()
        products = Product.query.filter(
            Product.user_id == user_id,
            Product.name.ilike(f'%{keyword}%')
        ).all()
        
        if not products:
            return f"❌ No products found matching '{keyword}'"
        
        result = "🔍 Search Results:\n\n"
        for product in products:
            result += f"• {product.name} - ${product.price:.2f} ({product.stock} in stock) - {product.category}\n"
        return result
    
    # Handle update command
    if message.startswith('update product:'):
        try:
            # Parse the command
            parts = message[len('update product:'):].strip().split(',')
            if len(parts) != 3:
                return "❌ Invalid format. Use: update product: [name], [field], [value]"
            
            name = parts[0].strip()
            field = parts[1].strip().lower()
            value = parts[2].strip()
            
            # Find the product
            product = Product.query.filter_by(name=name, user_id=user_id).first()
            if not product:
                return f"❌ Product '{name}' not found"
            
            # Update the field
            if field == 'price':
                product.price = float(value)
            elif field == 'stock':
                product.stock = int(value)
            elif field == 'category':
                product.category = value
            else:
                return f"❌ Invalid field '{field}'. Use: price, stock, or category"
            
            db.session.commit()
            return f"✅ Product '{name}' updated successfully!"
            
        except ValueError as e:
            return f"❌ Error: {str(e)}"
        except Exception as e:
            return f"❌ Error updating product: {str(e)}"
    
    # Handle delete command
    if message.startswith('delete product:'):
        name = message[len('delete product:'):].strip()
        product = Product.query.filter_by(name=name, user_id=user_id).first()
        
        if not product:
            return f"❌ Product '{name}' not found"
        
        db.session.delete(product)
        db.session.commit()
        return f"✅ Product '{name}' deleted successfully!"
    
    # Handle show all products command
    if message == 'show all products':
        products = Product.query.filter_by(user_id=user_id).all()
        
        if not products:
            return "❌ No products found"
        
        result = "📦 All Products:\n\n"
        for product in products:
            result += f"• {product.name} - ${product.price:.2f} ({product.stock} in stock) - {product.category}\n"
        return result
    
    # Handle category command
    if message.startswith('category '):
        category = message[len('category '):].strip()
        products = Product.query.filter_by(category=category, user_id=user_id).all()
        
        if not products:
            return f"❌ No products found in category '{category}'"
        
        result = f"📦 Products in {category}:\n\n"
        for product in products:
            result += f"• {product.name} - ${product.price:.2f} ({product.stock} in stock)\n"
        return result
    
    return "I can help you with:\n1. Searching products\n2. Adding products\n3. Updating products\n4. Deleting products\n5. Showing all products\n6. Showing products by category\n\nPlease let me know what you'd like to do!"

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(username=data['username'], email=data['email'], is_new_user=True)
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    session['user_id'] = user.id
    
    return jsonify({
        'message': 'Registration successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_new_user': True
        }
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'})

@app.route('/api/chat', methods=['POST'])
def chat():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    
    # Handle welcome message
    if user_message.lower() == 'welcome':
        print(f"Sending welcome message to user: {user.username}")  # Debug log
        response = get_welcome_message(user.username)
        # Save welcome message to database
        welcome_message = Message(
            content=response,
            role='assistant',
            user_id=user.id
        )
        db.session.add(welcome_message)
        db.session.commit()
        print(f"Welcome message saved to database for user: {user.username}")  # Debug log
        return jsonify({'response': response})
    
    # Get response from process_command
    response = process_command(user_message, user.id)
    
    # Save messages to database
    if user_message.lower() != 'welcome':  # Don't save the welcome trigger message
        user_msg = Message(
            content=user_message,
            role='user',
            user_id=user.id
        )
        db.session.add(user_msg)
    
    assistant_msg = Message(
        content=response,
        role='assistant',
        user_id=user.id
    )
    db.session.add(assistant_msg)
    db.session.commit()
    
    return jsonify({'response': response})

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    messages = Message.query.filter_by(user_id=user.id).order_by(Message.timestamp).all()
    return jsonify({
        'messages': [{
            'role': msg.role,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat()
        } for msg in messages]
    })

if __name__ == '__main__':
    app.run(debug=True) 