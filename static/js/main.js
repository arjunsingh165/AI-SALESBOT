// DOM Elements
const authSection = document.getElementById('auth-section');
const chatSection = document.getElementById('chat-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const voiceInputBtn = document.getElementById('voice-input-btn');
const logoutBtn = document.getElementById('logout-btn');
const tabBtns = document.querySelectorAll('.tab-btn');

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

// Speech Synthesis Setup
const synth = window.speechSynthesis;

// State
let currentUser = null;
let isListening = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
        showChatSection();
    }
});

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const formType = btn.dataset.tab;
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${formType}-form`).classList.add('active');
    });
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showChatSection();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
    }
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

voiceInputBtn.addEventListener('click', toggleVoiceInput);

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    currentUser = null;
    showAuthSection();
});

// Functions
function showChatSection() {
    authSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
}

function showAuthSection() {
    chatSection.classList.add('hidden');
    authSection.classList.remove('hidden');
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addMessage(data.response, 'bot');
            speakMessage(data.response);
        } else {
            addMessage('Sorry, there was an error processing your request.', 'bot');
        }
    } catch (error) {
        console.error('Chat error:', error);
        addMessage('Sorry, there was an error processing your request.', 'bot');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleVoiceInput() {
    if (!isListening) {
        recognition.start();
        voiceInputBtn.style.background = '#ff4444';
        isListening = true;
    } else {
        recognition.stop();
        voiceInputBtn.style.background = '#667eea';
        isListening = false;
    }
}

recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    messageInput.value = text;
    toggleVoiceInput();
    sendMessage();
};

recognition.onend = () => {
    voiceInputBtn.style.background = '#667eea';
    isListening = false;
};

function speakMessage(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
} 