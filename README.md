# E-commerce Sales Chatbot

A comprehensive e-commerce chatbot solution that enhances the shopping experience through natural language interaction and voice capabilities.

## Features

- User authentication (login/register)
- Voice input and output capabilities
- Product search and information retrieval
- Responsive design for all devices
- Secure session management
- Chat history tracking
- Mock product database

## Technology Stack

- **Backend**: Python/Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: MySQL
- **Authentication**: JWT
- **Voice Processing**: Web Speech API

## Prerequisites

- Python 3.7+
- MySQL Server
- Modern web browser with Web Speech API support

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd EcommerceChatbot
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up the MySQL database:
```sql
CREATE DATABASE ecommerce_chatbot;
```

5. Configure environment variables:
Create a `.env` file in the project root with:
```
SECRET_KEY=your-secret-key
DATABASE_URL=mysql://username:password@localhost/ecommerce_chatbot
```

6. Initialize the database and seed mock data:
```bash
python seed_products.py
```

7. Run the application:
```bash
python app.py
```

8. Access the application at `http://localhost:5000`

## Project Structure

```
EcommerceChatbot/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── seed_products.py      # Database seeding script
├── static/
│   ├── css/
│   │   └── style.css     # Stylesheets
│   └── js/
│       └── main.js       # Frontend JavaScript
└── templates/
    └── index.html        # Main HTML template
```

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/products` - Get all products
- `POST /api/chat` - Chat interaction

## Voice Commands

The chatbot supports voice input for:
- Product searches
- General queries
- Navigation commands

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Secure session management
- Input validation and sanitization

## Future Enhancements

1. Product recommendations
2. Shopping cart integration
3. Order tracking
4. Multi-language support
5. Advanced product filtering
6. Integration with payment gateways

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 