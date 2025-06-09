from app import app, db, Product
import random

def seed_database():
    # Create all tables
    with app.app_context():
        db.create_all()
        
        # Clear existing products
        Product.query.delete()
        
        # Sample products
        products = [
            {
                'name': 'iPhone 13',
                'price': 799.99,
                'category': 'Electronics',
                'stock': 50
            },
            {
                'name': 'Samsung Galaxy S21',
                'price': 699.99,
                'category': 'Electronics',
                'stock': 45
            },
            {
                'name': 'MacBook Pro',
                'price': 1299.99,
                'category': 'Electronics',
                'stock': 30
            },
            {
                'name': 'Nike Air Max',
                'price': 129.99,
                'category': 'Footwear',
                'stock': 100
            },
            {
                'name': 'Adidas T-Shirt',
                'price': 29.99,
                'category': 'Clothing',
                'stock': 200
            },
            {
                'name': 'Sony Headphones',
                'price': 199.99,
                'category': 'Electronics',
                'stock': 75
            },
            {
                'name': 'Levi\'s Jeans',
                'price': 59.99,
                'category': 'Clothing',
                'stock': 150
            },
            {
                'name': 'Canon Camera',
                'price': 899.99,
                'category': 'Electronics',
                'stock': 25
            }
        ]

        # Add products to database
        for product_data in products:
            product = Product(**product_data)
            db.session.add(product)

        # Commit changes
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database() 